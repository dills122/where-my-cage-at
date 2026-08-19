import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FilmographyRepository } from 'src/app/repositories';
import { createMovie } from 'src/testing/fixtures';
import { FilmographyService } from './filmography.service';

describe('FilmographyService', () => {
	let service: FilmographyService;
	let http: HttpTestingController;
	let repository: jasmine.SpyObj<FilmographyRepository>;

	beforeEach(() => {
		repository = jasmine.createSpyObj<FilmographyRepository>('FilmographyRepository', ['set']);
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [{ provide: FilmographyRepository, useValue: repository }]
		});
		service = TestBed.inject(FilmographyService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('fetches the filmography catalogue and publishes it to the repository', () => {
		const movies = [createMovie()];

		service.getFilmographyCredits().subscribe();
		const request = http.expectOne(req => req.url.endsWith('/filmography'));
		request.flush(movies);

		expect(request.request.method).toBe('GET');
		expect(repository.set).toHaveBeenCalledOnceWith(movies);
	});
});
