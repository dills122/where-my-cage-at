import { createMovie } from 'src/testing/fixtures';
import { FilmNodeComponent } from './film-node.component';

describe('FilmNodeComponent', () => {
	it('builds the TMDB link from the required movie input', () => {
		const component = new FilmNodeComponent();
		component.filmOverview = createMovie({ id: 42 });

		component.ngOnInit();

		expect(component.tmdbUrl).toBe('https://www.themoviedb.org/movie/42?language=en-US');
	});
});
