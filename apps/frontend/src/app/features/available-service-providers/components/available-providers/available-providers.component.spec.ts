import { firstValueFrom, of } from 'rxjs';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';
import { createMovie, createOffer, createServiceProvider } from 'src/testing/fixtures';
import { AvailableProvidersComponent } from './available-providers.component';

describe('AvailableProvidersComponent', () => {
	it('returns only providers with Cage movies, sorted by name', async () => {
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
		const result = await firstValueFrom(component.serviceProvidersWithFilmsAvailable$);

		expect(result.map(provider => provider.clearName)).toEqual(['Hulu', 'Netflix']);
		expect(component.trackServiceProvider(0, result[0])).toBe(15);
	});
});
