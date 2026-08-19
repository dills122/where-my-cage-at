import { MovieRecord, Offer, ServiceProvider } from '../app/models';

export const createOffer = (overrides: Partial<Offer> = {}): Offer => ({
	providerId: 8,
	monetizationType: 'flatrate',
	packageShortName: 'nfx',
	retailPrice: 9.99,
	currency: 'USD',
	urls: { standardWeb: 'https://example.com/watch' },
	presentationType: 'hd',
	country: 'US',
	...overrides
});

export const createMovie = (overrides: Partial<MovieRecord> = {}): MovieRecord => ({
	id: 1,
	imdbId: 'tt0000001',
	title: 'Moonstruck',
	poster: '/poster.jpg',
	originalReleaseYear: 1987,
	tmdbPopularity: 7.5,
	runtime: 102,
	originalLanguage: 'en',
	ageCertification: 'PG',
	cinemaReleaseDate: '1987-12-16',
	shortDescription: 'A test movie.',
	objectType: 'movie',
	localizedReleaseDate: 'December 16, 1987',
	offers: [createOffer()],
	genres: ['Comedy', 'Romance'],
	...overrides
});

export const createServiceProvider = (overrides: Partial<ServiceProvider> = {}): ServiceProvider => ({
	id: 8,
	technicalName: 'netflix',
	shortName: 'nfx',
	clearName: 'Netflix',
	monetizationTypes: ['flatrate'],
	iconUrl: '/icon/123/profile',
	...overrides
});
