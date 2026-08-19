import { MovieRecord, ServiceProvider } from '../models';
import { FilmographyRepository } from './filmography.repository';
import { ServiceProviderRepository } from './service-provider.repository';

describe('catalogue repositories', () => {
	it('keep large catalogues in memory without writing browser storage', () => {
		const setItem = spyOn(Storage.prototype, 'setItem').and.throwError(
			new DOMException('Quota exceeded', 'QuotaExceededError')
		);
		const movie = {
			id: 1,
			shortDescription: 'x'.repeat(5 * 1024 * 1024)
		} as MovieRecord;
		const provider = { id: 2, clearName: 'Provider' } as ServiceProvider;

		expect(() => new FilmographyRepository().set([movie])).not.toThrow();
		expect(() => new ServiceProviderRepository().set([provider])).not.toThrow();
		expect(setItem).not.toHaveBeenCalled();
	});

	it('is immediately ready without persisted state hydration', () => {
		let filmographyInitialized = false;
		let providersInitialized = false;

		new FilmographyRepository().initialized$.subscribe(value => (filmographyInitialized = value));
		new ServiceProviderRepository().initialized$.subscribe(value => (providersInitialized = value));

		expect(filmographyInitialized).toBeTrue();
		expect(providersInitialized).toBeTrue();
	});
});
