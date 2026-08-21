import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { createMovie, createServiceProvider } from 'src/testing/fixtures';
import { HttpCatalogueDataSource } from './http-catalogue-data-source';

describe('HttpCatalogueDataSource', () => {
	let dataSource: HttpCatalogueDataSource;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [HttpCatalogueDataSource, provideHttpClient(), provideHttpClientTesting()]
		});
		dataSource = TestBed.inject(HttpCatalogueDataSource);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('loads the filmography catalogue', () => {
		const movies = [createMovie()];

		dataSource.getFilmography().subscribe(records => expect(records).toEqual(movies));
		const request = http.expectOne(req => req.url.endsWith('/filmography'));
		expect(request.request.method).toBe('GET');
		request.flush(movies);
	});

	it('loads a single film for direct detail routes', () => {
		const movie = createMovie({ id: 42 });

		dataSource.getFilmographyCredit(42).subscribe(record => expect(record).toEqual(movie));
		const request = http.expectOne(req => req.url.endsWith('/filmography/42'));
		expect(request.request.method).toBe('GET');
		request.flush(movie);
	});

	it('loads the service provider catalogue', () => {
		const providers = [createServiceProvider()];

		dataSource.getServiceProviders().subscribe(records => expect(records).toEqual(providers));
		const request = http.expectOne(req => req.url.endsWith('/service-providers'));
		expect(request.request.method).toBe('GET');
		request.flush(providers);
	});
});
