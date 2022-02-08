import { Injectable } from '@nestjs/common';
import RedisServiceBase from 'src/shared/base-redis.service';

@Injectable()
export class ServiceProvidersService extends RedisServiceBase {
	async getAll() {
		if (!this.isConnected) {
			await this.connect();
		}
		return await this.client.getProviders();
	}
}
