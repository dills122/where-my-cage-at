import { Component, Input, OnInit } from '@angular/core';
import { Offer, WatchUrlsMap } from 'src/app/models';
import { mapToActionName } from '../../service-providers-monetization-types-mapping';

@Component({
	selector: 'app-provider-watch-now',
	templateUrl: './provider-watch-now.component.html',
	styleUrls: ['./provider-watch-now.component.scss']
})
export class ProviderWatchNowComponent implements OnInit {
	@Input()
	offers: Offer[] = [];
	@Input()
	providerId!: number;
	offersForProvider: Offer[] = [];

	constructor() {}
	ngOnInit(): void {
		this.offersForProvider = this.offers.filter(offer => offer.providerId === this.providerId);
	}

	createLabelName(monetizationType: string, presentationType: string) {
		return `${mapToActionName(monetizationType)}:${presentationType.toLocaleUpperCase()}`;
	}

	openExternalLink(urls: WatchUrlsMap) {
		if (!urls.standardWeb) {
			//TODO better way to handle this situation
			return;
		}
		window.open(urls.standardWeb, '_blank');
	}
}
