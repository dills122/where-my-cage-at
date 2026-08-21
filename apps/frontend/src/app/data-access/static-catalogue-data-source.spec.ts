import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMovie, createServiceProvider } from 'src/testing/fixtures';
import { StaticCatalogueDataSource } from './static-catalogue-data-source';

describe('StaticCatalogueDataSource', () => {
	let dataSource: StaticCatalogueDataSource;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [StaticCatalogueDataSource, provideHttpClient(), provideHttpClientTesting()]
		});
		dataSource = TestBed.inject(StaticCatalogueDataSource);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('loads and caches the generated filmography', () => {
		const movies = [createMovie({ id: 42 })];

		dataSource.getFilmography().subscribe(records => expect(records).toEqual(movies));
		dataSource.getFilmographyCredit(42).subscribe(record => expect(record).toEqual(movies[0]));

		const request = http.expectOne('/assets/catalogue/filmography.json');
		expect(request.request.method).toBe('GET');
		request.flush(movies);
		http.expectNone('/assets/catalogue/filmography.json');
	});

	it('reports a missing direct-route credit', () => {
		let error: Error | undefined;
		dataSource.getFilmographyCredit(404).subscribe({ error: cause => (error = cause) });

		http.expectOne('/assets/catalogue/filmography.json').flush([]);

		expect(error?.message).toBe('Catalogue credit 404 was not found');
	});

	it('loads and caches the generated service providers', () => {
		const providers = [createServiceProvider()];

		dataSource.getServiceProviders().subscribe(records => expect(records).toEqual(providers));
		dataSource.getServiceProviders().subscribe(records => expect(records).toEqual(providers));

		const request = http.expectOne('/assets/catalogue/service-providers.json');
		expect(request.request.method).toBe('GET');
		request.flush(providers);
		http.expectNone('/assets/catalogue/service-providers.json');
	});
});
