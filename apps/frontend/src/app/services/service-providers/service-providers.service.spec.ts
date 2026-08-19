import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServiceProviderRepository } from 'src/app/repositories';
import { createServiceProvider } from 'src/testing/fixtures';
import { ServiceProvidersService } from './service-providers.service';

describe('ServiceProvidersService', () => {
	let service: ServiceProvidersService;
	let http: HttpTestingController;
	let repository: jasmine.SpyObj<ServiceProviderRepository>;

	beforeEach(() => {
		repository = jasmine.createSpyObj<ServiceProviderRepository>('ServiceProviderRepository', ['set']);
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [{ provide: ServiceProviderRepository, useValue: repository }]
		});
		service = TestBed.inject(ServiceProvidersService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('fetches the provider catalogue and publishes it to the repository', () => {
		const providers = [createServiceProvider()];

		service.getServiceProviders().subscribe();
		const request = http.expectOne(req => req.url.endsWith('/service-providers'));
		request.flush(providers);

		expect(request.request.method).toBe('GET');
		expect(repository.set).toHaveBeenCalledOnceWith(providers);
	});
});
