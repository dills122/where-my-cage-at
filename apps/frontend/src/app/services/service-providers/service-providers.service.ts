import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CATALOGUE_DATA_SOURCE, CatalogueDataSource } from 'src/app/data-access';
import { ServiceProviderRepository } from 'src/app/repositories/service-provider.repository';

@Injectable({
	providedIn: 'root'
})
export class ServiceProvidersService {
	constructor(
		@Inject(CATALOGUE_DATA_SOURCE) private readonly dataSource: CatalogueDataSource,
		private serviceProviderRepository: ServiceProviderRepository
	) {}
	getServiceProviders() {
		return this.dataSource
			.getServiceProviders()
			.pipe(tap(providers => this.serviceProviderRepository.set(providers)));
	}
}
