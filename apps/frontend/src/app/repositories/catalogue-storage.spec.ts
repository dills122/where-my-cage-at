import { TestBed } from '@angular/core/testing';
import { MovieRecord, ServiceProvider } from '../models';
import { FilmographyRepository } from './filmography.repository';
import { ServiceProviderRepository } from './service-provider.repository';

describe('catalogue repositories', () => {
	let filmography: FilmographyRepository;
	let providers: ServiceProviderRepository;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [FilmographyRepository, ServiceProviderRepository]
		});
		filmography = TestBed.inject(FilmographyRepository);
		providers = TestBed.inject(ServiceProviderRepository);
	});

	it('keep large catalogues in memory without writing browser storage', () => {
		const setItem = spyOn(Storage.prototype, 'setItem').and.throwError(
			new DOMException('Quota exceeded', 'QuotaExceededError')
		);
		const movie = {
			id: 1,
			shortDescription: 'x'.repeat(5 * 1024 * 1024)
		} as MovieRecord;
		const provider = { id: 2, clearName: 'Provider' } as ServiceProvider;

		expect(() => filmography.set([movie])).not.toThrow();
		expect(() => providers.set([provider])).not.toThrow();
		expect(filmography.credits()).toEqual([movie]);
		expect(providers.serviceProviders()).toEqual([provider]);
		expect(setItem).not.toHaveBeenCalled();
	});

	it('is immediately ready without persisted state hydration', () => {
		let filmographyInitialized = false;
		let providersInitialized = false;

		filmography.initialized$.subscribe(value => (filmographyInitialized = value));
		providers.initialized$.subscribe(value => (providersInitialized = value));

		expect(filmographyInitialized).toBeTrue();
		expect(providersInitialized).toBeTrue();
	});

	it('supports entity lookups and provider-filtered film queries', () => {
		const provider = { id: 2, clearName: 'Provider' } as ServiceProvider;
		const selected = {
			id: 1,
			offers: [{ providerId: provider.id }]
		} as MovieRecord;
		const other = { id: 3, offers: [] } as unknown as MovieRecord;
		filmography.set([selected, other]);
		providers.set([provider]);

		filmography.getCredit(selected.id).subscribe(credit => expect(credit).toBe(selected));
		filmography
			.getAllCreditsByProviderId(provider.id)
			.subscribe(credits => expect(credits).toEqual([selected]));
		providers.getServiceProviderByName('provider').subscribe(match => expect(match).toBe(provider));
	});
});
