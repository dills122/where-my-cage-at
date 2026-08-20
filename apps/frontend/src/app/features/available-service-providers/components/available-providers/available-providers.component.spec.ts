import { firstValueFrom, of } from 'rxjs';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';
import { createMovie, createOffer, createServiceProvider } from 'src/testing/fixtures';
import { AvailableProvidersComponent } from './available-providers.component';

describe('AvailableProvidersComponent', () => {
	it('returns only providers with Cage movies in access-based groups', async () => {
		const providers = [
			createServiceProvider({ id: 8, clearName: 'Netflix' }),
			createServiceProvider({ id: 15, clearName: 'Hulu' }),
			createServiceProvider({ id: 384, clearName: 'Max' })
		];
		const movies = [
			createMovie({ offers: [createOffer({ providerId: 8 }), createOffer({ providerId: 15 })] })
		];
		const component = new AvailableProvidersComponent(
			{ serviceProviders$: of(providers) } as ServiceProviderRepository,
			{ credits$: of(movies) } as FilmographyRepository
		);

		component.ngOnInit();
		const result = await firstValueFrom(component.providerCatalogue$);

		expect(result.totalProviders).toBe(2);
		expect(result.groups.map(group => group.key)).toEqual(['subscription']);
		expect(result.groups[0].collections[0].providers.map(provider => provider.clearName)).toEqual([
			'Hulu',
			'Netflix'
		]);
		expect(component.trackServiceProvider(0, result.groups[0].collections[0].providers[0])).toBe(15);
	});
});
