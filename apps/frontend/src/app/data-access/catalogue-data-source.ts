import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRecord, ServiceProvider } from '../models';

/**
 * Boundary between catalogue consumers and its transport/storage format.
 * A future static JSON implementation can replace the HTTP source without
 * changing services, stores, or components.
 */
export interface CatalogueDataSource {
	getFilmography(): Observable<MovieRecord[]>;
	getFilmographyCredit(creditId: number): Observable<MovieRecord>;
	getServiceProviders(): Observable<ServiceProvider[]>;
}

export const CATALOGUE_DATA_SOURCE = new InjectionToken<CatalogueDataSource>('CATALOGUE_DATA_SOURCE');
