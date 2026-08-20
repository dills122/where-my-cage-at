import { MoviePosterComponent } from './movie-poster.component';

describe('MoviePosterComponent', () => {
	it('uses suitable intrinsic dimensions and decorative alt text by default', () => {
		const component = new MoviePosterComponent();
		component.title = 'Moonstruck';

		expect(component.intrinsicWidth).toBe(92);
		expect(component.intrinsicHeight).toBe(138);
		expect(component.altText).toBe('');

		component.variant = 'detail';
		component.decorative = false;
		expect(component.intrinsicWidth).toBe(342);
		expect(component.intrinsicHeight).toBe(513);
		expect(component.altText).toBe('Moonstruck poster');
	});

	it('resets a failed image when the poster path changes', () => {
		const component = new MoviePosterComponent();
		component.posterPath = '/first.jpg';
		component.handleError();
		expect(component.hasError).toBeTrue();

		component.posterPath = '/second.jpg';
		expect(component.hasError).toBeFalse();
	});
});
