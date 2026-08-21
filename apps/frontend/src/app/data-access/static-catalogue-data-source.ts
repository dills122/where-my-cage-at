import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MovieRecord, ServiceProvider } from '../models';
import { CatalogueDataSource } from './catalogue-data-source';

const CATALOGUE_BASE_URL = '/assets/catalogue';

@Injectable()
export class StaticCatalogueDataSource implements CatalogueDataSource {
	private readonly http = inject(HttpClient);
	private readonly filmography$ = this.http
		.get<MovieRecord[]>(`${CATALOGUE_BASE_URL}/filmography.json`)
		.pipe(shareReplay({ bufferSize: 1, refCount: false }));
	private readonly serviceProviders$ = this.http
		.get<ServiceProvider[]>(`${CATALOGUE_BASE_URL}/service-providers.json`)
		.pipe(shareReplay({ bufferSize: 1, refCount: false }));

	getFilmography(): Observable<MovieRecord[]> {
		return this.filmography$;
	}

	getFilmographyCredit(creditId: number): Observable<MovieRecord> {
		return this.filmography$.pipe(
			map(records => {
				const record = records.find(candidate => candidate.id === creditId);
				if (!record) {
					throw new Error(`Catalogue credit ${creditId} was not found`);
				}

				return record;
			})
		);
	}

	getServiceProviders(): Observable<ServiceProvider[]> {
		return this.serviceProviders$;
	}
}
