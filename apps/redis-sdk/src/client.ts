import { ReJSON } from 'redis-modules-sdk';
import { MovieRecord, ServiceProvider } from './data-types';

export class FullClient {
	private _client: ReJSON;
	private _connected: boolean;
	constructor({ host, port }: { host: string; port: string }) {
		this._client = new ReJSON({
			host,
			port
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
			await this._client.set(
				key,
				'$',
				JSON.stringify({
					records: serviceProviders
				})
			);
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
			await this._client.set(
				key,
				'$',
				JSON.stringify({
					records: movieRecords
				})
			);
		} catch (err) {
			console.error(err);
			await this.disconnect();
			throw err;
		}
	}

	async clearEntryIfExistsAlready(key: string) {
		try {
			const entry = await this._client.get(key, '$');
			if (entry == null || entry === '') {
				return;
			}
			await this._client.clear(key, '$');
		} catch (err) {
			console.error(err);
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
