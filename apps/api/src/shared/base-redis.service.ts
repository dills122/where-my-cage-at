import { ReadOnlyClient } from 'redis-sdk';

export default class RedisServiceBase {
  protected client: ReadOnlyClient;
  protected isConnected = false;
  constructor() {
    this.client = new ReadOnlyClient({
      host: 'localhost',
      port: '6379',
    });
  }
  protected async connect() {
    await this.client.connect();
    this.isConnected = true;
  }

  protected async disconnect() {
    await this.client.disconnect();
    this.isConnected = false;
  }
}
