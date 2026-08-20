import assert from 'node:assert/strict';
import test from 'node:test';
import { FullClient } from '../src/client';
import {
	CataloguePublication,
	CatalogueRefreshStatus,
	MovieRecord,
	ServiceProvider
} from '../src/data-types';
import { ReadOnlyClient } from '../src/readonly-client';
import { RedisClientLike, RedisMultiLike } from '../src/redis-client';
import config from '../src/shared';

function createFakeRedis(
	initialValues: Record<string, unknown> = {},
	options: { failTransaction?: boolean } = {}
) {
	const calls: Array<{ method: string; args: unknown[] }> = [];
	const values = new Map<string, unknown>(Object.entries(initialValues));
	const client = {
		connect: async () => calls.push({ method: 'connect', args: [] }),
		disconnect: async () => calls.push({ method: 'disconnect', args: [] }),
		get: async (key: string) => {
			calls.push({ method: 'string.get', args: [key] });
			return (values.get(key) as string | undefined) || null;
		},
		set: async (key: string, value: string, options?: { NX?: boolean; PX?: number }) => {
			calls.push({ method: 'string.set', args: [key, value, options] });
			if (options?.NX && values.has(key)) {
				return null;
			}
			values.set(key, value);
			return 'OK';
		},
		eval: async (script: string, options: { keys: string[]; arguments: string[] }) => {
			calls.push({ method: 'eval', args: [script, options] });
			const [key] = options.keys;
			const [token] = options.arguments;
			if (values.get(key) !== token) {
				return 0;
			}
			if (script.includes('pexpire')) {
				return 1;
			}
			values.delete(key);
			return 1;
		},
		multi: () => {
			const operations: Array<() => void> = [];
			const transaction = {
				set: (key: string, value: string) => {
					calls.push({ method: 'multi.set', args: [key, value] });
					operations.push(() => values.set(key, value));
					return transaction;
				},
				json: {
					set: (key: string, path: string, value: unknown) => {
						calls.push({ method: 'multi.json.set', args: [key, path, value] });
						operations.push(() => values.set(key, value));
						return transaction;
					}
				},
				exec: async () => {
					calls.push({ method: 'exec', args: [] });
					if (options.failTransaction) {
						throw new Error('transaction failed');
					}
					operations.forEach(operation => operation());
					return [];
				}
			} as RedisMultiLike;
			return transaction;
		},
		json: {
			get: async (key: string) => {
				calls.push({ method: 'json.get', args: [key] });
				return values.get(key) ?? null;
			},
			del: async (key: string) => {
				calls.push({ method: 'json.del', args: [key] });
				return values.delete(key) ? 1 : 0;
			},
			set: async (key: string, path: string, value: unknown) => {
				calls.push({ method: 'json.set', args: [key, path, value] });
				values.set(key, value);
				return 'OK';
			}
		}
	} as RedisClientLike;

	return { calls, client, values };
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

const status: CatalogueRefreshStatus = {
	state: 'success',
	version: 'version-2',
	startedAt: '2026-08-19T00:00:00.000Z',
	completedAt: '2026-08-19T00:00:01.000Z',
	durationMs: 1000,
	counts: { credits: 1, movies: 1, serviceProviders: 1, failed: 0 },
	failures: []
};

const publication: CataloguePublication = {
	version: status.version,
	movies: [movie],
	serviceProviders: [provider],
	status
};

test('FullClient stages both catalogues before atomically activating their version', async () => {
	const { calls, client, values } = createFakeRedis();
	const redis = new FullClient({ host: 'redis', port: '6379', client });

	await redis.publishCatalog(publication);

	assert.deepEqual(values.get(config.movieCatalogVersionPath(status.version)), {
		records: [movie]
	});
	assert.deepEqual(values.get(config.serviceProvidersVersionPath(status.version)), {
		records: [provider]
	});
	assert.equal(values.get(config.activeCatalogVersionPath), status.version);
	assert.deepEqual(values.get(config.refreshStatusPath), {
		...status,
		activeVersion: status.version
	});
	assert.deepEqual(
		calls.map(call => call.method),
		['connect', 'json.set', 'json.set', 'multi.set', 'multi.json.set', 'exec']
	);
});

test('FullClient leaves the active version unchanged when activation fails', async () => {
	const { client, values } = createFakeRedis(
		{ [config.activeCatalogVersionPath]: 'version-1' },
		{ failTransaction: true }
	);
	const redis = new FullClient({ host: 'redis', port: '6379', client });

	await assert.rejects(redis.publishCatalog(publication), /transaction failed/);

	assert.equal(values.get(config.activeCatalogVersionPath), 'version-1');
	assert.deepEqual(values.get(config.movieCatalogVersionPath(status.version)), {
		records: [movie]
	});
	assert.deepEqual(values.get(config.serviceProvidersVersionPath(status.version)), {
		records: [provider]
	});
});

test('ReadOnlyClient resolves both catalogues through the active version', async () => {
	const { client } = createFakeRedis({
		[config.activeCatalogVersionPath]: status.version,
		[config.movieCatalogVersionPath(status.version)]: { records: [movie] },
		[config.serviceProvidersVersionPath(status.version)]: { records: [provider] },
		[config.refreshStatusPath]: { ...status, activeVersion: status.version }
	});
	const redis = new ReadOnlyClient({ host: 'redis', port: '6379', client });

	assert.deepEqual(await redis.getMovieCatalog(), [movie]);
	assert.deepEqual(await redis.getProviders(), [provider]);
	assert.deepEqual(await redis.getRefreshStatus(), {
		...status,
		activeVersion: status.version
	});
});

test('ReadOnlyClient falls back to legacy keys before the first versioned publication', async () => {
	const { client } = createFakeRedis({
		[config.movieCatalogPath]: { records: [movie] },
		[config.serviceProvidersPath]: { records: [provider] }
	});
	const redis = new ReadOnlyClient({ host: 'redis', port: '6379', client });

	assert.deepEqual(await redis.getMovieCatalog(), [movie]);
	assert.deepEqual(await redis.getProviders(), [provider]);
});

test('FullClient records a failed refresh against the retained active version', async () => {
	const { client, values } = createFakeRedis({ [config.activeCatalogVersionPath]: 'version-1' });
	const redis = new FullClient({ host: 'redis', port: '6379', client });
	const failedStatus: CatalogueRefreshStatus = { ...status, state: 'failed' };

	await redis.recordRefreshFailure(failedStatus);

	assert.deepEqual(values.get(config.refreshStatusPath), {
		...failedStatus,
		activeVersion: 'version-1'
	});
});

test('FullClient leases the refresh lock to only one owner', async () => {
	const { client } = createFakeRedis();
	const first = new FullClient({ host: 'redis', port: '6379', client });
	const second = new FullClient({ host: 'redis', port: '6379', client });

	assert.equal(await first.acquireRefreshLock('owner-1', 60_000), true);
	assert.equal(await second.acquireRefreshLock('owner-2', 60_000), false);
	assert.equal(await first.extendRefreshLock('owner-1', 60_000), true);
	assert.equal(await second.releaseRefreshLock('owner-2'), false);
	assert.equal(await first.releaseRefreshLock('owner-1'), true);
	assert.equal(await second.acquireRefreshLock('owner-2', 60_000), true);
});
