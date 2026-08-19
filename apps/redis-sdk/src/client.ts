import { CataloguePublication, CatalogueRefreshStatus, MovieRecord, ServiceProvider } from './data-types';
import { createRedisClient, RedisClientLike } from './redis-client';
import config from './shared';

export class FullClient {
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

	async publishCatalog({ version, movies, serviceProviders, status }: CataloguePublication) {
		await this.ensureConnected();
		const movieKey = config.movieCatalogVersionPath(version);
		const providerKey = config.serviceProvidersVersionPath(version);

		// Versioned data is invisible to readers until the pointer transaction commits.
		try {
			await this._client.json.set(movieKey, '$', { records: movies });
			await this._client.json.set(providerKey, '$', { records: serviceProviders });
		} catch (err) {
			await Promise.allSettled([this._client.json.del(movieKey), this._client.json.del(providerKey)]);
			throw err;
		}

		// A connection error after EXEC may still mean Redis committed the pointer. Keep the staged
		// keys so readers never follow an active version to data that was subsequently removed.
		await this._client
			.multi()
			.set(config.activeCatalogVersionPath, version)
			.json.set(config.refreshStatusPath, '$', {
				...status,
				activeVersion: version
			})
			.exec();
	}

	async recordRefreshFailure(status: CatalogueRefreshStatus) {
		await this.ensureConnected();
		const activeVersion = await this._client.get(config.activeCatalogVersionPath);
		await this._client.json.set(config.refreshStatusPath, '$', {
			...status,
			activeVersion: activeVersion || undefined
		});
	}

	async updateServiceProviders(serviceProviders: ServiceProvider[]) {
		const key = config.serviceProvidersPath;
		try {
			await this.ensureConnected();
			await this.clearEntryIfExistsAlready(key);
			await this._client.json.set(key, '$', {
				records: serviceProviders
			});
		} catch (err) {
			console.error(err);
			await this.disconnect();
			throw err;
		}
	}

	async updateMovieCatalog(movieRecords: MovieRecord[]) {
		const key = config.movieCatalogPath;
		try {
			await this.ensureConnected();
			await this.clearEntryIfExistsAlready(key);
			await this._client.json.set(key, '$', {
				records: movieRecords
			});
		} catch (err) {
			console.error(err);
			await this.disconnect();
			throw err;
		}
	}

	async clearEntryIfExistsAlready(key: string) {
		try {
			const entry = await this._client.json.get(key, '$');
			if (entry == null || entry === '') {
				return;
			}
			await this._client.json.del(key, '$');
		} catch (err) {
			console.error(err);
			return;
		}
	}

	async disconnect() {
		if (!this._connected) {
			return;
		}
		try {
			await this._client.disconnect();
		} catch (err) {
			return;
		} finally {
			this._connected = false;
		}
	}

	private async ensureConnected() {
		if (!this._connected) {
			await this.connect();
		}
	}
}
