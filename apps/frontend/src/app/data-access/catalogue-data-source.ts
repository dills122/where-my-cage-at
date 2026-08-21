import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieRecord, ServiceProvider } from '../models';

/**
 * Boundary between catalogue consumers and its transport/storage format.
 * Keeps catalogue consumers independent from the generated static JSON format.
 */
export interface CatalogueDataSource {
	getFilmography(): Observable<MovieRecord[]>;
	getFilmographyCredit(creditId: number): Observable<MovieRecord>;
	getServiceProviders(): Observable<ServiceProvider[]>;
}

export const CATALOGUE_DATA_SOURCE = new InjectionToken<CatalogueDataSource>('CATALOGUE_DATA_SOURCE');
