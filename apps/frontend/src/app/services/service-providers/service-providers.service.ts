import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ServiceProvider } from 'src/app/models';
import {
	ServiceProviderRepository,
	skipServiceProviderWhileCached
} from 'src/app/repositories/service-provider.repository';
import { buildBaseApuUrlBasedOffEnv } from 'src/app/util/api-url-builder';

@Injectable({
	providedIn: 'root'
})
export class ServiceProvidersService {
	private apiURL = buildBaseApuUrlBasedOffEnv(isDevMode());
	constructor(private http: HttpClient, private serviceProviderRepository: ServiceProviderRepository) {}
	getServiceProviders() {
		return this.http.get<ServiceProvider[]>(`${this.apiURL}/service-providers`).pipe(
			tap(this.serviceProviderRepository.set),
			skipServiceProviderWhileCached('service-provider', {
				value: 'full'
			})
		);
	}
}
