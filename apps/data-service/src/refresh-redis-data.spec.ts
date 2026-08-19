import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ObjectSearchResult } from '@dills1220/wtw/index';
import { CataloguePublication, CatalogueRefreshStatus, MovieRecord, ServiceProvider } from 'redis-sdk';
import {
	executeWithRetry,
	iterateThroughCredits,
	refreshCatalogue,
	RetryPolicy,
	UpdateFailures
} from './refresh-redis-data';
import { Movie } from './types';

const createCredit = (id: number, title = `Movie ${id}`): ObjectSearchResult => ({
	id,
	title,
	fullPath: `/movie/${id}`,
	fullPaths: { en: `/movie/${id}` },
	poster: `/poster-${id}.jpg`,
	originalReleaseYear: 2024,
	tmdbPopularity: 10,
	objectType: 'movie',
	localizedReleaseDate: '2024-01-01',
	productionCountries: ['US'],
	scoring: [{ providerType: 'tmdb:id', value: id }],
	ageCertification: 'PG',
	cinemaReleaseDate: '2024-01-01',
	shortDescription: title,
	externalIds: [{ provider: 'imdb', externalId: `tt${id}` }],
	offers: []
});

const createMovie = (id: number, title = `Movie ${id}`): Movie => ({
	adult: false,
	budget: 0,
	homepage: '',
	id,
	imdbId: `tt${id}`,
	popularity: 10,
	posterPath: `/movie-${id}.jpg`,
	backdropPath: null,
	releaseDate: '2024-01-01',
	runtime: 120,
	title,
	originalTitle: title,
	originalLanguage: 'en',
	revenue: 0,
	overview: '',
	genres: ['Drama'],
	shortDescription: title,
	ageCertification: 'PG',
	cinemaReleaseDate: '2024-01-01'
});

const provider: ServiceProvider = {
	id: 8,
	technicalName: 'test',
	shortName: 'test',
	clearName: 'Test Provider',
	monetizationTypes: ['flatrate']
};

const createFailures = (): UpdateFailures => ({ totalFailed: 0, failedMovies: [] });

function createSource(credits: ObjectSearchResult[]) {
	return {
		getPersonsFilmography: async () => credits,
		getProviders: async () => [provider]
	};
}

function createPublisher(options: { failPublication?: boolean } = {}) {
	const calls: string[] = [];
	let publication: CataloguePublication | undefined;
	let failureStatus: CatalogueRefreshStatus | undefined;
	let activeVersion = 'last-successful-version';
	return {
		calls,
		get publication() {
			return publication;
		},
		get failureStatus() {
			return failureStatus;
		},
		get activeVersion() {
			return activeVersion;
		},
		connect: async () => {
			calls.push('connect');
		},
		disconnect: async () => {
			calls.push('disconnect');
		},
		publishCatalog: async (nextPublication: CataloguePublication) => {
			calls.push('publish');
			if (options.failPublication) {
				throw new Error('Redis transaction failed');
			}
			publication = nextPublication;
			activeVersion = nextPublication.version;
		},
		recordRefreshFailure: async (status: CatalogueRefreshStatus) => {
			calls.push('record-failure');
			failureStatus = { ...status, activeVersion };
		}
	};
}

const quietLog = async () => undefined;
const noWait = async () => undefined;

describe('Redis data refresh', () => {
	it('publishes a complete successful catalogue and records summary metrics', async () => {
		const publisher = createPublisher();
		const status = await refreshCatalogue({
			source: createSource([createCredit(1), createCredit(2)]),
			redisClient: publisher,
			fetchMovieData: async ({ movieId, title }) => createMovie(movieId, title),
			log: quietLog,
			createVersion: () => 'successful-version',
			now: (() => {
				const times = [1000, 1250];
				return () => times.shift() || 1250;
			})()
		});

		assert.equal(status.state, 'success');
		assert.equal(status.durationMs, 250);
		assert.deepEqual(status.counts, {
			credits: 2,
			movies: 2,
			serviceProviders: 1,
			failed: 0
		});
		assert.equal(publisher.publication?.movies.length, 2);
		assert.deepEqual(publisher.calls, ['connect', 'publish', 'disconnect']);
	});

	it('allows a partial refresh at the configured failure threshold', async () => {
		const publisher = createPublisher();
		const credits = Array.from({ length: 10 }, (_value, index) => createCredit(index + 1));
		const status = await refreshCatalogue({
			source: createSource(credits),
			redisClient: publisher,
			fetchMovieData: async ({ movieId, title }) => {
				if (movieId === 10) {
					throw new Error('not found');
				}
				return createMovie(movieId, title);
			},
			log: quietLog,
			createVersion: () => 'partial-version',
			maxFailureRatio: 0.1
		});

		assert.equal(status.state, 'success');
		assert.equal(status.counts.movies, 9);
		assert.equal(status.counts.failed, 1);
		assert.deepEqual(status.failures, [{ id: 10, title: 'Movie 10', message: 'not found' }]);
		assert.equal(publisher.publication?.movies.length, 9);
	});

	it('rejects a partial refresh above the configured failure threshold', async () => {
		const publisher = createPublisher();
		const credits = Array.from({ length: 10 }, (_value, index) => createCredit(index + 1));

		await assert.rejects(
			refreshCatalogue({
				source: createSource(credits),
				redisClient: publisher,
				fetchMovieData: async ({ movieId, title }) => {
					if (movieId >= 9) {
						throw new Error('not found');
					}
					return createMovie(movieId, title);
				},
				log: quietLog,
				createVersion: () => 'rejected-partial-version',
				maxFailureRatio: 0.1
			}),
			/failure ratio 0.200 exceeded 0.1/
		);

		assert.equal(publisher.publication, undefined);
		assert.equal(publisher.activeVersion, 'last-successful-version');
		assert.equal(publisher.failureStatus?.counts.movies, 8);
	});

	it('rejects a total enrichment failure and retains the active catalogue', async () => {
		const publisher = createPublisher();

		await assert.rejects(
			refreshCatalogue({
				source: createSource([createCredit(1), createCredit(2)]),
				redisClient: publisher,
				fetchMovieData: async () => {
					throw new Error('not found');
				},
				log: quietLog,
				createVersion: () => 'failed-version'
			}),
			/no enriched movies/
		);

		assert.equal(publisher.publication, undefined);
		assert.equal(publisher.activeVersion, 'last-successful-version');
		assert.equal(publisher.failureStatus?.state, 'failed');
		assert.equal(publisher.failureStatus?.counts.failed, 2);
		assert.deepEqual(publisher.calls, ['connect', 'record-failure', 'disconnect']);
	});

	it('records a failed publish without activating its staged version', async () => {
		const publisher = createPublisher({ failPublication: true });

		await assert.rejects(
			refreshCatalogue({
				source: createSource([createCredit(1)]),
				redisClient: publisher,
				fetchMovieData: async ({ movieId, title }) => createMovie(movieId, title),
				log: quietLog,
				createVersion: () => 'rolled-back-version'
			}),
			/Redis transaction failed/
		);

		assert.equal(publisher.activeVersion, 'last-successful-version');
		assert.equal(publisher.failureStatus?.activeVersion, 'last-successful-version');
		assert.deepEqual(publisher.calls, [
			'connect',
			'publish',
			'disconnect',
			'connect',
			'record-failure',
			'disconnect'
		]);
	});

	it('bounds concurrent enrichment while preserving catalogue order', async () => {
		const movies: MovieRecord[] = [];
		const failures = createFailures();
		let active = 0;
		let maximumActive = 0;
		const credits = Array.from({ length: 6 }, (_value, index) => createCredit(index + 1));

		await iterateThroughCredits(
			credits,
			movies,
			failures,
			async ({ movieId, title }) => {
				active++;
				maximumActive = Math.max(maximumActive, active);
				await new Promise(resolve => setImmediate(resolve));
				active--;
				return createMovie(movieId, title);
			},
			{ concurrency: 2 }
		);

		assert.equal(maximumActive, 2);
		assert.deepEqual(
			movies.map(movie => movie.id),
			[1, 2, 3, 4, 5, 6]
		);
	});

	it('honors Retry-After for rate limits before retrying', async () => {
		const delays: number[] = [];
		let attempts = 0;
		const policy: RetryPolicy = {
			maxAttempts: 3,
			timeoutMs: 100,
			baseDelayMs: 10,
			maxDelayMs: 100
		};

		const result = await executeWithRetry(
			async () => {
				attempts++;
				if (attempts === 1) {
					throw {
						response: { statusCode: 429, headers: { 'retry-after': '2' } }
					};
				}
				return 'ok';
			},
			policy,
			async delay => {
				delays.push(delay);
				await noWait();
			}
		);

		assert.equal(result, 'ok');
		assert.equal(attempts, 2);
		assert.deepEqual(delays, [2000]);
	});

	it('bounds every external attempt with a timeout', async () => {
		let attempts = 0;
		await assert.rejects(
			executeWithRetry(
				async () => {
					attempts++;
					return new Promise<string>(() => undefined);
				},
				{
					maxAttempts: 2,
					timeoutMs: 5,
					baseDelayMs: 0,
					maxDelayMs: 0
				},
				noWait
			),
			/timed out after 5ms/
		);
		assert.equal(attempts, 2);
	});
});
