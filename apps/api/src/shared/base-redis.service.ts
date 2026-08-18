import { ReadOnlyClient } from 'redis-sdk';

export default class RedisServiceBase {
	protected client: ReadOnlyClient;
	protected isConnected = false;
	constructor() {
		const ENV = process.env.NODE_ENV;
		const isProd = ENV === 'prod';
		this.client = new ReadOnlyClient({
			host: process.env.REDIS_HOST || (isProd ? 'redis' : 'localhost'),
			port: process.env.REDIS_PORT || '6379',
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
