import { MovieRecord } from '..';
import { CatalogueRefreshStatus, ServiceProvider } from './data-types';
import { createRedisClient, RedisClientLike } from './redis-client';
import config from './shared';

export class ReadOnlyClient {
	private _client: RedisClientLike;
	private _connected: boolean;
	constructor({ host, port, client }: { host: string; port: string; client?: RedisClientLike }) {
		this._client =
			client ||
			createRedisClient({
				host,
				port
			});
	}

	async connect() {
		if (this._connected) {
			return;
		}
		await this._client.connect();
		this._connected = true;
	}

	async disconnect() {
		try {
			await this._client.disconnect();
		} catch (err) {
			return;
		} finally {
			this._connected = false;
		}
	}

	async getProviders(): Promise<ServiceProvider[]> {
		try {
			await this.ensureConnected();
			const version = await this._client.get(config.activeCatalogVersionPath);
			const key = version ? config.serviceProvidersVersionPath(version) : config.serviceProvidersPath;
			const providers = await this._client.json.get(key);
			if (providers == null || providers === '') {
				throw Error('No records found');
			}
			const { records } = providers as {
				records: ServiceProvider[];
			};
			return records;
		} catch (err) {
			console.error(err);
			await this.disconnect();
			throw err;
		}
	}

	async getMovieCatalog(): Promise<MovieRecord[]> {
		try {
			await this.ensureConnected();
			const version = await this._client.get(config.activeCatalogVersionPath);
			const key = version ? config.movieCatalogVersionPath(version) : config.movieCatalogPath;
			const movies = await this._client.json.get(key);
			if (movies == null || movies === '') {
				throw Error('No records found');
			}
			const { records } = movies as {
				records: MovieRecord[];
			};
			return records;
		} catch (err) {
			console.error(err);
			await this.disconnect();
			throw err;
		}
	}

	async getRefreshStatus(): Promise<CatalogueRefreshStatus> {
		try {
			await this.ensureConnected();
			const status = await this._client.json.get(config.refreshStatusPath);
			if (status == null || status === '') {
				throw Error('No refresh status found');
			}
			return status as CatalogueRefreshStatus;
		} catch (err) {
			console.error(err);
			await this.disconnect();
			throw err;
		}
	}

	private async ensureConnected() {
		if (!this._connected) {
			await this.connect();
		}
	}
}
