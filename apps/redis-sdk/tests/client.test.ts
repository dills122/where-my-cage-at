import assert from 'node:assert/strict';
import test from 'node:test';
import { FullClient } from '../src/client';
import { MovieRecord, ServiceProvider } from '../src/data-types';
import { ReadOnlyClient } from '../src/readonly-client';
import { RedisClientLike } from '../src/redis-client';

function createFakeRedis(initialValue: unknown = null) {
	const calls: Array<{ method: string; args: unknown[] }> = [];
	let storedValue = initialValue;
	const client = {
		connect: async () => calls.push({ method: 'connect', args: [] }),
		disconnect: async () => calls.push({ method: 'disconnect', args: [] }),
		json: {
			get: async (...args: unknown[]) => {
				calls.push({ method: 'get', args });
				return storedValue;
			},
			del: async (...args: unknown[]) => {
				calls.push({ method: 'del', args });
				storedValue = null;
				return 1;
			},
			set: async (...args: unknown[]) => {
				calls.push({ method: 'set', args });
				storedValue = args[2];
				return 'OK';
			}
		}
	} as RedisClientLike;

	return { calls, client };
}

const movie: MovieRecord = {
	id: 42,
	imdbId: 'tt0000042',
	title: 'Moonstruck',
	poster: '/poster.jpg',
	originalReleaseYear: 1987,
	tmdbPopularity: 7.5,
	runtime: 102,
	originalLanguage: 'en',
	ageCertification: 'PG',
	cinemaReleaseDate: '1987-12-16',
	shortDescription: 'A test movie.',
	objectType: 'movie',
	localizedReleaseDate: 'December 16, 1987',
	offers: [],
	genres: []
};

const provider: ServiceProvider = {
	id: 8,
	technicalName: 'netflix',
	shortName: 'nfx',
	clearName: 'Netflix',
	monetizationTypes: ['flatrate']
};

test('FullClient replaces an existing movie catalogue', async () => {
	const { calls, client } = createFakeRedis({ records: [{ id: 1 }] });
	const redis = new FullClient({ host: 'redis', port: '6379', client });

	await redis.updateMovieCatalog([movie]);

	assert.deepEqual(
		calls.map(call => call.method),
		['connect', 'get', 'del', 'set']
	);
	assert.deepEqual(calls[3].args, ['moviecatalog:jsondata', '$', { records: [movie] }]);
});

test('FullClient writes providers without deleting an absent catalogue', async () => {
	const { calls, client } = createFakeRedis();
	const redis = new FullClient({ host: 'redis', port: '6379', client });

	await redis.updateServiceProviders([provider]);

	assert.deepEqual(
		calls.map(call => call.method),
		['connect', 'get', 'set']
	);
	assert.deepEqual(calls[2].args, ['serviceproviders:jsondata', '$', { records: [provider] }]);
});

test('ReadOnlyClient returns stored movie and provider records', async () => {
	const movies = createFakeRedis({ records: [movie] });
	const movieClient = new ReadOnlyClient({ host: 'redis', port: '6379', client: movies.client });
	assert.deepEqual(await movieClient.getMovieCatalog(), [movie]);

	const providers = createFakeRedis({ records: [provider] });
	const providerClient = new ReadOnlyClient({
		host: 'redis',
		port: '6379',
		client: providers.client
	});
	assert.deepEqual(await providerClient.getProviders(), [provider]);
});
