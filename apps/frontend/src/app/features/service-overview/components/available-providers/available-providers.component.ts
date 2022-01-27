import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceProvider } from 'src/app/models';
import { ServiceProviderRepository } from 'src/app/repositories';

@Component({
	selector: 'app-available-providers',
	templateUrl: './available-providers.component.html',
	styleUrls: ['./available-providers.component.scss']
})
export class AvailableProvidersComponent {
	serviceProviders$: Observable<ServiceProvider[]>;
	constructor(private serviceProviderRepository: ServiceProviderRepository) {
		this.serviceProviders$ = this.serviceProviderRepository.serviceProviders$;
	}

	// ngOnInit(): void {

	// }
}
