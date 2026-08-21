import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { MovieRecord, ServiceProvider } from '../models';
import { buildBaseApuUrlBasedOffEnv } from '../util/api-url-builder';
import { CatalogueDataSource } from './catalogue-data-source';

@Injectable()
export class HttpCatalogueDataSource implements CatalogueDataSource {
	private readonly apiURL = buildBaseApuUrlBasedOffEnv(isDevMode());

	constructor(private readonly http: HttpClient) {}

	getFilmography() {
		return this.http.get<MovieRecord[]>(`${this.apiURL}/filmography`);
	}

	getFilmographyCredit(creditId: number) {
		return this.http.get<MovieRecord>(`${this.apiURL}/filmography/${creditId}`);
	}

	getServiceProviders() {
		return this.http.get<ServiceProvider[]>(`${this.apiURL}/service-providers`);
	}
}
