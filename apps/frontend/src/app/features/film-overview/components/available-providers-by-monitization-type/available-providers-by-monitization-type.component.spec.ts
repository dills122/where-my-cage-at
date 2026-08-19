import { of } from 'rxjs';
import { ServiceProviderRepository } from 'src/app/repositories';
import { createOffer } from 'src/testing/fixtures';
import { MonetizationTypes } from '../../../service-provider-overview/service-providers-monetization-types-mapping';
import { AvailableProvidersByMonitizationTypeComponent } from './available-providers-by-monitization-type.component';

describe('AvailableProvidersByMonitizationTypeComponent', () => {
	it('deduplicates matching providers and exposes their first watch URL', () => {
		const repository = jasmine.createSpyObj<ServiceProviderRepository>('ServiceProviderRepository', [
			'getSubsetOfProviders'
		]);
		repository.getSubsetOfProviders.and.returnValue(of([]));
		const component = new AvailableProvidersByMonitizationTypeComponent(repository);
		component.monitizationType = MonetizationTypes.SUBSCRIPTION;
		component.offers = [
			createOffer({ providerId: 8, urls: { standardWeb: 'https://example.com/first' } }),
			createOffer({ providerId: 8, urls: { standardWeb: 'https://example.com/second' } }),
			createOffer({ providerId: 15, monetizationType: MonetizationTypes.RENT })
		];

		component.ngOnInit();
		component.getViewingOptionsBasedOnViewingPreference(MonetizationTypes.SUBSCRIPTION);

		expect(component.title).toBe('Stream Now');
		expect(repository.getSubsetOfProviders).toHaveBeenCalledOnceWith([8]);
		expect(component.getFirstUrlForServiceProvider(8, MonetizationTypes.SUBSCRIPTION)).toBe(
			'https://example.com/first'
		);
		expect(component.checkForProvidersWithDesiredMonitizationModel(MonetizationTypes.RENT)).toBeTrue();
	});
});
