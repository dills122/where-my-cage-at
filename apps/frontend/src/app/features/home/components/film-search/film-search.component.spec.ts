import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FilmographyRepository } from 'src/app/repositories';
import { createMovie } from 'src/testing/fixtures';
import { FilmSearchComponent } from './film-search.component';

describe('FilmSearchComponent', () => {
	it('indexes catalogue titles, searches them, and navigates to a selection', () => {
		const repository = {
			credits$: of([createMovie({ id: 42, title: 'Moonstruck' }), createMovie({ id: 7, title: 'Mandy' })])
		} as FilmographyRepository;
		const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
		const component = new FilmSearchComponent(repository, router);

		component.ngOnInit();
		component.search({ originalEvent: new Event('input'), query: 'Moon' });
		component.navigate({ originalEvent: new Event('click'), value: component.results[0] });

		expect(component.searchDictonary).toEqual([
			{ id: 42, title: 'Moonstruck', poster: '/poster.jpg', originalReleaseYear: 1987 },
			{ id: 7, title: 'Mandy', poster: '/poster.jpg', originalReleaseYear: 1987 }
		]);
		expect(component.results[0]).toEqual({
			id: 42,
			title: 'Moonstruck',
			poster: '/poster.jpg',
			originalReleaseYear: 1987
		});
		expect(router.navigate).toHaveBeenCalledOnceWith(['/film-overview/42']);
	});
});
