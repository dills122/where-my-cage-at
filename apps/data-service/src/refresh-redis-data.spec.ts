import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ObjectSearchResult } from '@dills1220/wtw/index';
import { MovieRecord, ServiceProvider } from 'redis-sdk';
import { Movie } from './types';
import { iterateThroughCredits, UpdateFailures, updateEntireRedisInstance } from './refresh-redis-data';

const createCredit = (id: number, title: string): ObjectSearchResult => ({
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

const createMovie = (id: number, title: string): Movie => ({
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

const createFailures = (): UpdateFailures => ({
	totalFailed: 0,
	failedMovies: []
});

describe('Redis data refresh', () => {
	it('keeps successful movie enrichments when another lookup fails', async () => {
		const movies: MovieRecord[] = [];
		const failures = createFailures();
		const credits = [createCredit(1, 'Successful Movie'), createCredit(2, 'Missing Movie')];

		await iterateThroughCredits(credits, movies, failures, async ({ movieId, title }) => {
			if (movieId === 2) {
				throw new Error('TMDB lookup failed');
			}
			return createMovie(movieId, title || 'Untitled');
		});

		assert.deepEqual(
			movies.map(movie => movie.id),
			[1]
		);
		assert.deepEqual(failures, {
			totalFailed: 1,
			failedMovies: [{ title: 'Missing Movie', id: 2 }]
		});
	});

	it('publishes both catalogues and disconnects', async () => {
		const calls: string[] = [];
		const movies = [{ id: 1 }] as MovieRecord[];
		const providers = [{ id: 2 }] as ServiceProvider[];
		const client = {
			connect: async () => {
				calls.push('connect');
			},
			disconnect: async () => {
				calls.push('disconnect');
			},
			updateMovieCatalog: async (records: MovieRecord[]) => {
				assert.equal(records, movies);
				calls.push('movies');
			},
			updateServiceProviders: async (records: ServiceProvider[]) => {
				assert.equal(records, providers);
				calls.push('providers');
			}
		};

		await updateEntireRedisInstance(movies, providers, client, async () => undefined);

		assert.deepEqual(calls, ['connect', 'movies', 'providers', 'disconnect']);
	});

	it('disconnects and rejects when catalogue publication fails', async () => {
		const calls: string[] = [];
		const client = {
			connect: async () => {
				calls.push('connect');
			},
			disconnect: async () => {
				calls.push('disconnect');
			},
			updateMovieCatalog: async () => {
				calls.push('movies');
				throw new Error('Redis unavailable');
			},
			updateServiceProviders: async () => {
				calls.push('providers');
			}
		};

		await assert.rejects(
			updateEntireRedisInstance([], [], client, async () => undefined),
			/Redis unavailable/
		);
		assert.deepEqual(calls, ['connect', 'movies', 'disconnect']);
	});
});
