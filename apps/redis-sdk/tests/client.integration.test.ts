import assert from 'node:assert/strict';
import test from 'node:test';
import { FullClient } from '../src/client';
import { MovieRecord, ServiceProvider } from '../src/data-types';
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
		await writer.connect();
		await writer.updateMovieCatalog([movie]);
		await writer.updateServiceProviders([provider]);

		assert.deepEqual(await reader.getMovieCatalog(), [movie]);
		assert.deepEqual(await reader.getProviders(), [provider]);
	} finally {
		await writer.disconnect();
		await reader.disconnect();
	}
});
