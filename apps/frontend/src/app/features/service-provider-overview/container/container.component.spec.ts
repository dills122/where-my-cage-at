import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';
import { createMovie, createServiceProvider } from 'src/testing/fixtures';
import { ContainerComponent } from './container.component';

describe('Service provider overview ContainerComponent', () => {
	it('loads provider details and matching movies from the route', () => {
		const providerRepository = jasmine.createSpyObj<ServiceProviderRepository>('ServiceProviderRepository', [
			'getServiceProviderById'
		]);
		const filmographyRepository = jasmine.createSpyObj<FilmographyRepository>('FilmographyRepository', [
			'getAllCreditsByProviderId'
		]);
		providerRepository.getServiceProviderById.and.returnValue(of(createServiceProvider({ id: 8 })));
		filmographyRepository.getAllCreditsByProviderId.and.returnValue(of([createMovie()]));
		const route = {
			paramMap: of(convertToParamMap({ serviceId: '8' }))
		} as ActivatedRoute;
		const component = new ContainerComponent(providerRepository, filmographyRepository, route);

		component.ngOnInit();

		expect(component.serviceId).toBe(8);
		expect(providerRepository.getServiceProviderById).toHaveBeenCalledOnceWith(8);
		expect(filmographyRepository.getAllCreditsByProviderId).toHaveBeenCalledOnceWith(8);
	});
});
