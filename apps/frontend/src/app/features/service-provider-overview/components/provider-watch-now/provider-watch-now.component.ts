import { Component, Input, OnInit } from '@angular/core';
import { Offer, WatchUrlsMap } from 'src/app/models';
import { mapToActionName } from '../../service-providers-monetization-types-mapping';

@Component({
	selector: 'app-provider-watch-now',
	templateUrl: './provider-watch-now.component.html',
	styleUrls: ['./provider-watch-now.component.scss'],
	standalone: false
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
		return `${mapToActionName(monetizationType)} · ${this.formatPresentationType(presentationType)}`;
	}

	formatPresentationType(presentationType: string): string {
		return presentationType.replace(/^_+/, '').toLocaleUpperCase();
	}

	shouldShowPrice(offer: Offer): boolean {
		return (
			['buy', 'rent'].includes(offer.monetizationType) && offer.retailPrice > 0 && Boolean(offer.currency)
		);
	}

	formatPrice(offer: Offer): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: offer.currency,
			maximumFractionDigits: 2
		}).format(offer.retailPrice);
	}

	openExternalLink(urls: WatchUrlsMap) {
		if (!urls.standardWeb) {
			//TODO better way to handle this situation
			return;
		}
		window.open(urls.standardWeb, '_blank', 'noopener,noreferrer');
	}
}
