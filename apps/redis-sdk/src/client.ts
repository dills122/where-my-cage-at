import { createClient } from 'redis';
import { MovieRecord, ServiceProvider } from './data-types';

export class FullClient {
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

	async updateServiceProviders(serviceProviders: ServiceProvider[]) {
		const key = 'serviceproviders:jsondata';
		try {
			if (!this._connected) {
				await this.connect();
			}
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
		const key = 'moviecatalog:jsondata';
		try {
			if (!this._connected) {
				await this.connect();
			}
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
		try {
			await this._client.disconnect();
			this._connected = false;
		} catch (err) {
			return;
		}
	}
}
