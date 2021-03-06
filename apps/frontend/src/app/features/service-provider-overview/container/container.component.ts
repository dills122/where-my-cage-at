import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MovieRecord, ServiceProvider } from 'src/app/models';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';
import { mapToFriendlyVerbousName } from '../service-providers-monetization-types-mapping';

@Component({
	selector: 'app-service-overview-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
	readonly serviceProviderCardHeader: string = 'Service Provider Overview:';
	serviceId!: number;
	serviceProviderData$!: Observable<ServiceProvider>;
	filmsAvailable$!: Observable<MovieRecord[]>;
	constructor(
		private serviceProviderRepository: ServiceProviderRepository,
		private filmographyRepository: FilmographyRepository,
		private route: ActivatedRoute
	) {}
	ngOnInit(): void {
		this.route.paramMap.subscribe(paramMap => {
			this.serviceId = Number(paramMap.get('serviceId') || '');
			this.serviceProviderData$ = this.serviceProviderRepository.getServiceProviderById(this.serviceId);
			this.filmsAvailable$ = this.filmographyRepository.getAllCreditsByProviderId(this.serviceId);
		});
	}

	mapMonetizationType(monetizationType: string) {
		return mapToFriendlyVerbousName(monetizationType);
	}
}
