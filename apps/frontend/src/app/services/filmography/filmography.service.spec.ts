import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CATALOGUE_DATA_SOURCE, CatalogueDataSource } from 'src/app/data-access';
import { FilmographyRepository } from 'src/app/repositories';
import { createMovie } from 'src/testing/fixtures';
import { FilmographyService } from './filmography.service';

describe('FilmographyService', () => {
	let service: FilmographyService;
	let repository: jasmine.SpyObj<FilmographyRepository>;
	let dataSource: jasmine.SpyObj<CatalogueDataSource>;

	beforeEach(() => {
		repository = jasmine.createSpyObj<FilmographyRepository>('FilmographyRepository', ['set']);
		dataSource = jasmine.createSpyObj<CatalogueDataSource>('CatalogueDataSource', [
			'getFilmography',
			'getFilmographyCredit',
			'getServiceProviders'
		]);
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				{ provide: FilmographyRepository, useValue: repository },
				{ provide: CATALOGUE_DATA_SOURCE, useValue: dataSource }
			]
		});
		service = TestBed.inject(FilmographyService);
	});

	it('loads the filmography catalogue through the configured source and publishes it', () => {
		const movies = [createMovie()];
		dataSource.getFilmography.and.returnValue(of(movies));

		service.getFilmographyCredits().subscribe();

		expect(dataSource.getFilmography).toHaveBeenCalledTimes(1);
		expect(repository.set).toHaveBeenCalledOnceWith(movies);
	});

	it('loads one film through the configured source for a cold detail route', () => {
		const movie = createMovie({ id: 42 });
		dataSource.getFilmographyCredit.and.returnValue(of(movie));

		service.getFilmographyCredit(42).subscribe(record => expect(record).toEqual(movie));

		expect(dataSource.getFilmographyCredit).toHaveBeenCalledOnceWith(42);
	});
});
