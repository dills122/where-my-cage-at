import { ReJSON } from 'redis-modules-sdk';
import { MovieRecord, ServiceProvider } from './data-types';

export default class FullClient {
  private _client: ReJSON;
  private _connected: boolean;
  constructor({ host, port }: { host: string; port: string }) {
    this._client = new ReJSON({
      host,
      port
      //TODO update with connection info
    });
  }

  async connect() {
    await this._client.connect();
    this._connected = true;
  }

  async updateServiceProviders(serviceProviders: ServiceProvider[]) {
    try {
      if (!this._connected) {
        await this.connect();
      }
      await this._client.set(
        'serviceproviders:jsondata',
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
    try {
      if (!this._connected) {
        await this.connect();
      }
      await this._client.set(
        'moviecatalog:jsondata',
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

  async disconnect() {
    try {
      await this._client.disconnect();
      this._connected = false;
    } catch (err) {
      return;
    }
  }
}
