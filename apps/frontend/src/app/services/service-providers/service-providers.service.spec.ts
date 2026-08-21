import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CATALOGUE_DATA_SOURCE, CatalogueDataSource } from 'src/app/data-access';
import { ServiceProviderRepository } from 'src/app/repositories';
import { createServiceProvider } from 'src/testing/fixtures';
import { ServiceProvidersService } from './service-providers.service';

describe('ServiceProvidersService', () => {
	let service: ServiceProvidersService;
	let repository: jasmine.SpyObj<ServiceProviderRepository>;
	let dataSource: jasmine.SpyObj<CatalogueDataSource>;

	beforeEach(() => {
		repository = jasmine.createSpyObj<ServiceProviderRepository>('ServiceProviderRepository', ['set']);
		dataSource = jasmine.createSpyObj<CatalogueDataSource>('CatalogueDataSource', [
			'getFilmography',
			'getFilmographyCredit',
			'getServiceProviders'
		]);
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				{ provide: ServiceProviderRepository, useValue: repository },
				{ provide: CATALOGUE_DATA_SOURCE, useValue: dataSource }
			]
		});
		service = TestBed.inject(ServiceProvidersService);
	});

	it('loads the provider catalogue through the configured source and publishes it', () => {
		const providers = [createServiceProvider()];
		dataSource.getServiceProviders.and.returnValue(of(providers));

		service.getServiceProviders().subscribe();

		expect(dataSource.getServiceProviders).toHaveBeenCalledTimes(1);
		expect(repository.set).toHaveBeenCalledOnceWith(providers);
	});
});
