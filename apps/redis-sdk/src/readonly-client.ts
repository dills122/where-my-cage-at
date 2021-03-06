import { createClient } from 'redis';
import { MovieRecord } from '..';
import { ServiceProvider } from './data-types';
import config from './shared';

export class ReadOnlyClient {
	private _client;
	private _connected: boolean;
	constructor({ host, port }: { host: string; port: string }) {
		this._client = createClient({
			socket: {
				port: Number(port),
				host
			}
		});
	}

	async connect() {
		await this._client.connect();
		this._connected = true;
	}

	async disconnect() {
		try {
			await this._client.disconnect();
			this._connected = false;
		} catch (err) {
			return;
		}
	}

	async getProviders(): Promise<ServiceProvider[]> {
		try {
			if (!this._connected) {
				await this.connect();
			}
			const providers = await this._client.json.get(config.serviceProvidersPath);
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
			if (!this._connected) {
				await this.connect();
			}
			const movies = await this._client.json.get(config.movieCatalogPath);
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
}
