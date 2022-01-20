import { Injectable } from '@nestjs/common';
import { ReadOnlyClient } from 'redis-sdk';

@Injectable()
export class FilmographyService {
  private client: ReadOnlyClient;
  private isConnected = false;
  constructor() {
    this.client = new ReadOnlyClient({
      host: 'localhost',
      port: '6379',
    });
  }

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

  private async connect() {
    await this.client.connect();
    this.isConnected = true;
  }

  private async disconnect() {
    await this.client.disconnect();
    this.isConnected = false;
  }
}
