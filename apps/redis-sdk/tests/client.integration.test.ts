import assert from 'node:assert/strict';
import test from 'node:test';
import { FullClient } from '../src/client';
import { CatalogueRefreshStatus, MovieRecord, ServiceProvider } from '../src/data-types';
import { ReadOnlyClient } from '../src/readonly-client';

const port = process.env.REDIS_TEST_PORT;
if (!port) {
	throw new Error('REDIS_TEST_PORT must point to the isolated Redis test instance');
}

const movie: MovieRecord = {
	id: 4242,
	imdbId: 'tt0004242',
	title: 'Integration Test Movie',
	poster: '/integration.jpg',
	originalReleaseYear: 2024,
	tmdbPopularity: 1,
	runtime: 90,
	originalLanguage: 'en',
	ageCertification: 'PG',
	cinemaReleaseDate: '2024-01-01',
	shortDescription: 'Stored in an isolated Redis instance.',
	objectType: 'movie',
	localizedReleaseDate: '2024-01-01',
	offers: [],
	genres: ['Test']
};

const provider: ServiceProvider = {
	id: 4343,
	technicalName: 'integration-provider',
	shortName: 'integration',
	clearName: 'Integration Provider',
	monetizationTypes: ['flatrate']
};

test('publishes and reads catalogues through Redis JSON', async () => {
	const connection = { host: '127.0.0.1', port };
	const writer = new FullClient(connection);
	const reader = new ReadOnlyClient(connection);

	try {
		const status: CatalogueRefreshStatus = {
			state: 'success',
			version: 'integration-version',
			startedAt: '2026-08-19T00:00:00.000Z',
			completedAt: '2026-08-19T00:00:01.000Z',
			durationMs: 1000,
			counts: { credits: 1, movies: 1, serviceProviders: 1, failed: 0 },
			failures: []
		};
		await writer.publishCatalog({
			version: status.version,
			movies: [movie],
			serviceProviders: [provider],
			status
		});

		assert.deepEqual(await reader.getMovieCatalog(), [movie]);
		assert.deepEqual(await reader.getProviders(), [provider]);
		assert.deepEqual(await reader.getRefreshStatus(), {
			...status,
			activeVersion: status.version
		});
	} finally {
		await writer.disconnect();
		await reader.disconnect();
	}
});

test('allows only the lease owner to run a catalogue refresh', async () => {
	const connection = { host: '127.0.0.1', port };
	const first = new FullClient(connection);
	const second = new FullClient(connection);

	try {
		assert.equal(await first.acquireRefreshLock('integration-owner-1', 60_000), true);
		assert.equal(await second.acquireRefreshLock('integration-owner-2', 60_000), false);
		assert.equal(await second.releaseRefreshLock('integration-owner-2'), false);
		assert.equal(await first.extendRefreshLock('integration-owner-1', 60_000), true);
		assert.equal(await first.releaseRefreshLock('integration-owner-1'), true);
		assert.equal(await second.acquireRefreshLock('integration-owner-2', 60_000), true);
	} finally {
		await second.releaseRefreshLock('integration-owner-2');
		await first.disconnect();
		await second.disconnect();
	}
});
