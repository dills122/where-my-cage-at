import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { FilmographyService } from 'src/app/services/filmography/filmography.service';
import { createMovie } from 'src/testing/fixtures';
import { ContainerComponent } from './container.component';

describe('Film overview ContainerComponent', () => {
	it('loads the movie selected by the route', () => {
		const movie = createMovie({ id: 42, genres: ['Comedy'] });
		const filmographyService = jasmine.createSpyObj<FilmographyService>('FilmographyService', [
			'getFilmographyCredit'
		]);
		filmographyService.getFilmographyCredit.and.returnValue(of(movie));
		const route = {
			snapshot: { paramMap: convertToParamMap({ filmId: '42' }) }
		} as ActivatedRoute;
		const component = new ContainerComponent(filmographyService, route);

		component.ngOnInit();

		expect(filmographyService.getFilmographyCredit).toHaveBeenCalledOnceWith(42);
		component.filmRecord$.subscribe(record => expect(record).toEqual(movie));
	});
});
