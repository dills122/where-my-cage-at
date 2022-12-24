import { Component, Input, OnInit } from '@angular/core';
import {
	mapToActionName,
	MonetizationTypes
} from 'src/app/features/service-provider-overview/service-providers-monetization-types-mapping';
import { Offer } from 'src/app/models';
import { ServiceProviderRepository } from 'src/app/repositories';

@Component({
	selector: 'app-available-providers-by-monitization-type',
	templateUrl: './available-providers-by-monitization-type.component.html',
	styleUrls: ['./available-providers-by-monitization-type.component.scss']
})
export class AvailableProvidersByMonitizationTypeComponent implements OnInit {
	MonetizationTypes = MonetizationTypes;
	@Input() offers: Offer[] = [];
	@Input()
	monitizationType!: MonetizationTypes;
	title: string = '';

	constructor(private serviceProviderRepository: ServiceProviderRepository) {}

	ngOnInit(): void {
		this.title = mapToActionName(this.monitizationType.toString());
	}

	getViewingOptionsBasedOnViewingPreference(viewingPreference: MonetizationTypes) {
		const providerIds = this.offers
			.filter(offer => offer.monetizationType === viewingPreference)
			.map(offer => offer.providerId);
		const providerIdsSet = new Set(providerIds || []);
		return this.serviceProviderRepository.getSubsetOfProviders([...providerIdsSet]);
	}

	//TODO need to make this so each type/resolution link is available somehow
	getFirstUrlForServiceProvider(serviceProviderId: number, monetizationType: MonetizationTypes) {
		const [first] =
			this.offers
				.filter(
					offer => offer.providerId === serviceProviderId && offer.monetizationType === monetizationType
				)
				.map(offer => offer.urls?.standardWeb) || [];
		return first;
	}

	checkForProvidersWithDesiredMonitizationModel(monetizationType: MonetizationTypes) {
		if (!this.offers) {
			return false;
		}
		return this.offers.filter(offer => offer.monetizationType === monetizationType).length > 0;
	}
}
