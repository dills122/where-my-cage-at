import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { ObjectSearchResult } from '@dills1220/wtw/index';
import { CataloguePublication, MovieRecord, ServiceProvider } from 'redis-sdk';
import {
	createStaticCatalogueFiles,
	publishStaticCatalogue,
	refreshStaticCatalogue,
	StaticCatalogueManifest
} from './refresh-static-catalogue';
import { Movie } from './types';

const movie: MovieRecord = {
	id: 42,
	imdbId: 'tt0042',
	title: 'A Test Film',
	poster: '/test.jpg',
	originalReleaseYear: 2024,
	tmdbPopularity: 10,
	runtime: 120,
	originalLanguage: 'en',
	ageCertification: 'PG',
	cinemaReleaseDate: '2024-01-01',
	shortDescription: 'A deterministic fixture',
	objectType: 'movie',
	localizedReleaseDate: '2024-01-01',
	offers: [],
	genres: ['Drama']
};

const provider: ServiceProvider = {
	id: 8,
	technicalName: 'test',
	shortName: 'test',
	clearName: 'Test Provider',
	monetizationTypes: ['flatrate']
};

function createPublication(version = 'catalogue-v1'): CataloguePublication {
	return {
		version,
		movies: [movie],
		serviceProviders: [provider],
		status: {
			state: 'success',
			version,
			startedAt: '2026-08-20T12:00:00.000Z',
			completedAt: '2026-08-20T12:00:01.000Z',
			durationMs: 1000,
			counts: { credits: 1, movies: 1, serviceProviders: 1, failed: 0 },
			failures: []
		}
	};
}

describe('static catalogue publication', () => {
	it('creates the documented manifest and hashes the exact artifact bytes', () => {
		const files = createStaticCatalogueFiles(createPublication());
		const manifest = JSON.parse(files.manifest) as StaticCatalogueManifest;

		assert.deepEqual(manifest, {
			schemaVersion: 1,
			catalogueVersion: 'catalogue-v1',
			generatedAt: '2026-08-20T12:00:01.000Z',
			artifacts: [
				{
					path: 'filmography.json',
					recordCount: 1,
					sha256: createHash('sha256').update(files.filmography).digest('hex')
				},
				{
					path: 'service-providers.json',
					recordCount: 1,
					sha256: createHash('sha256').update(files.serviceProviders).digest('hex')
				}
			]
		});
	});

	it('promotes a complete directory and keeps the current catalogue on a failed refresh', async () => {
		const temporaryDirectory = await fs.mkdtemp(path.join(tmpdir(), 'wmca-static-catalogue-'));
		const outputDirectory = path.join(temporaryDirectory, 'catalogue');
		try {
			await publishStaticCatalogue(outputDirectory, createPublication());
			const filmographyBytes = await fs.readFile(path.join(outputDirectory, 'filmography.json'));
			const originalManifest = await fs.readFile(
				path.join(outputDirectory, 'catalogue-manifest.json'),
				'utf8'
			);
			const parsedManifest = JSON.parse(originalManifest) as StaticCatalogueManifest;
			assert.equal(
				parsedManifest.artifacts[0].sha256,
				createHash('sha256').update(filmographyBytes).digest('hex')
			);

			await assert.rejects(
				publishStaticCatalogue(outputDirectory, createPublication('catalogue-v2'), {
					beforePromote: async stagingDirectory => {
						const stagedFiles = await fs.readdir(stagingDirectory);
						assert.deepEqual(stagedFiles.sort(), [
							'catalogue-manifest.json',
							'filmography.json',
							'service-providers.json'
						]);
						throw new Error('simulated validation failure');
					}
				}),
				/simulated validation failure/
			);

			assert.equal(
				await fs.readFile(path.join(outputDirectory, 'catalogue-manifest.json'), 'utf8'),
				originalManifest
			);
			assert.deepEqual(await fs.readdir(outputDirectory), [
				'catalogue-manifest.json',
				'filmography.json',
				'service-providers.json'
			]);
			assert.equal(
				(await fs.readdir(temporaryDirectory)).some(entry => entry.includes('.staging-')),
				false
			);
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true, force: true });
		}
	});

	it('refuses to replace a directory that is not an existing static catalogue', async () => {
		const temporaryDirectory = await fs.mkdtemp(path.join(tmpdir(), 'wmca-static-safety-'));
		const outputDirectory = path.join(temporaryDirectory, 'unrelated-assets');
		await fs.mkdir(outputDirectory);
		await fs.writeFile(path.join(outputDirectory, 'keep.txt'), 'keep me', 'utf8');

		try {
			await assert.rejects(
				publishStaticCatalogue(outputDirectory, createPublication()),
				/not a schema-v1 static catalogue/
			);
			assert.equal(await fs.readFile(path.join(outputDirectory, 'keep.txt'), 'utf8'), 'keep me');
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true, force: true });
		}
	});

	it('reuses the resilient enrichment pipeline without connecting to Redis', async () => {
		const temporaryDirectory = await fs.mkdtemp(path.join(tmpdir(), 'wmca-static-refresh-'));
		const outputDirectory = path.join(temporaryDirectory, 'catalogue');
		const credit: ObjectSearchResult = {
			id: 42,
			title: movie.title,
			fullPath: '/movie/42',
			fullPaths: { en: '/movie/42' },
			poster: movie.poster,
			originalReleaseYear: 2024,
			tmdbPopularity: 10,
			objectType: 'movie',
			localizedReleaseDate: '2024-01-01',
			productionCountries: ['US'],
			scoring: [{ providerType: 'tmdb:id', value: 42 }],
			ageCertification: 'PG',
			cinemaReleaseDate: '2024-01-01',
			shortDescription: movie.shortDescription,
			externalIds: [{ provider: 'imdb', externalId: movie.imdbId }],
			offers: []
		};
		const enrichedMovie: Movie = {
			adult: false,
			budget: 0,
			homepage: '',
			id: 42,
			imdbId: movie.imdbId,
			popularity: 10,
			posterPath: movie.poster,
			backdropPath: null,
			releaseDate: '2024-01-01',
			runtime: 120,
			title: movie.title,
			originalTitle: movie.title,
			originalLanguage: 'en',
			revenue: 0,
			overview: '',
			genres: ['Drama'],
			shortDescription: movie.shortDescription,
			ageCertification: 'PG',
			cinemaReleaseDate: '2024-01-01'
		};

		try {
			const status = await refreshStaticCatalogue(outputDirectory, {
				source: {
					getPersonsFilmography: async () => [credit],
					getProviders: async () => [provider]
				},
				fetchMovieData: async () => enrichedMovie,
				log: async () => undefined,
				createVersion: () => 'static-v1',
				now: (() => {
					const times = [1000, 1250];
					return () => times.shift() || 1250;
				})()
			});

			assert.equal(status.version, 'static-v1');
			assert.equal(status.state, 'success');
			assert.deepEqual(
				JSON.parse(await fs.readFile(path.join(outputDirectory, 'filmography.json'), 'utf8')),
				[movie]
			);
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true, force: true });
		}
	});
});
