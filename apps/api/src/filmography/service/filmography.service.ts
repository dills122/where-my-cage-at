import { Injectable } from '@nestjs/common';
import { ReadOnlyClient } from 'redis-sdk';

@Injectable()
export class FilmographyService {
  client: ReadOnlyClient;
  isConnected = false;
  constructor() {
    this.client = new ReadOnlyClient({
      host: 'localhost',
      port: '6379',
    });
  }

  async getAll() {
    await this.connect();
    return await this.client.getMovieCatalog();
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
