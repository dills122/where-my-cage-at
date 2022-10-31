import { Injectable } from '@nestjs/common';
import RedisServiceBase from 'src/shared/base-redis.service';

@Injectable()
export class FilmographyService extends RedisServiceBase {
	async getAll() {
		if (!this.isConnected) {
			await this.connect();
		}
		return await this.client.getMovieCatalog();
	}

	async getRecord(tmdbId: number) {
		if (!this.isConnected) {
			await this.connect();
		}
		const records = await this.getAll();
		return records.find((record) => {
			return record.id === tmdbId;
		});
	}

	async getRecordsByProviderId(providerId: number) {
		if (!this.isConnected) {
			await this.connect();
		}
		const records = await this.getAll();
		return records.find((record) => {
			if (!record.offers) {
				return false;
			}
			return record.offers.some((offer) => offer.providerId === providerId);
		});
	}
}
