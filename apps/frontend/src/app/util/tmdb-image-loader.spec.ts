import { buildPosterImageUrl, tmdbPosterImageLoader } from './tmdb-image-loader';

describe('TMDB image loader', () => {
	it('uses the smallest supported poster size that covers the requested width', () => {
		expect(buildPosterImageUrl('/poster.jpg', 186)).toBe('https://image.tmdb.org/t/p/w342/poster.jpg');
		expect(tmdbPosterImageLoader({ src: 'poster.jpg', width: 500 })).toBe(
			'https://image.tmdb.org/t/p/w500/poster.jpg'
		);
	});

	it('uses the original image for oversized requests and preserves absolute URLs', () => {
		expect(buildPosterImageUrl('/poster.jpg', 900)).toBe('https://image.tmdb.org/t/p/original/poster.jpg');
		expect(buildPosterImageUrl('https://example.com/poster.jpg', 342)).toBe('https://example.com/poster.jpg');
	});
});
