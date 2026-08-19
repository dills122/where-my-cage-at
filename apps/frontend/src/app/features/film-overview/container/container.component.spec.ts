import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { FilmographyRepository } from 'src/app/repositories';
import { createMovie } from 'src/testing/fixtures';
import { ContainerComponent } from './container.component';

describe('Film overview ContainerComponent', () => {
	it('loads the movie selected by the route', () => {
		const movie = createMovie({ id: 42, genres: ['Comedy'] });
		const repository = jasmine.createSpyObj<FilmographyRepository>('FilmographyRepository', ['getCredit']);
		repository.getCredit.and.returnValue(of(movie));
		const route = {
			snapshot: { paramMap: convertToParamMap({ filmId: '42' }) }
		} as ActivatedRoute;
		const component = new ContainerComponent(repository, route);

		component.ngOnInit();

		expect(repository.getCredit).toHaveBeenCalledOnceWith(42);
		expect(component.filmRecord).toEqual(movie);
		expect(component.getGenres()).toEqual(['Comedy']);
	});
});
