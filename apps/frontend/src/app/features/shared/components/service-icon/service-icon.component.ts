import { Component, Input, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { buildBaseApuUrlBasedOffEnv } from 'src/app/util/api-url-builder';

@Component({
	selector: 'app-service-icon',
	templateUrl: './service-icon.component.html',
	styleUrls: ['./service-icon.component.scss'],
	standalone: false
})
export class ServiceIconComponent {
	private apiURL = buildBaseApuUrlBasedOffEnv(isDevMode());
	@Input() serviceId: number = -1;
	@Input() serviceName: string = '';
	@Input() externalUrl?: string;
	@Input() providerIconUrl?: string | null;
	@Input() interactive: boolean = true;

	constructor(private router: Router) {}

	get imageUrl() {
		return `${this.apiURL}/icons/${this.serviceId}.webp`;
	}
	get accessibleLabel() {
		return this.externalUrl
			? `Open ${this.serviceName} viewing option in a new tab`
			: `Browse ${this.serviceName} movies`;
	}

	openUrl() {
		if (!this.interactive) {
			return;
		}

		if (!this.externalUrl) {
			return this.openServicePage(this.serviceId);
		}
		window.open(this.externalUrl, '_blank', 'noopener,noreferrer');
	}

	openServicePage(serviceId: number) {
		this.router.navigate([`/service-provider-overview/${serviceId}`]);
	}

	useProviderFallback(event: Event) {
		const image = event.target as HTMLImageElement;
		const iconId = this.providerIconUrl?.split('/')[2];
		if (!iconId) {
			image.hidden = true;
			return;
		}

		const fallbackUrl = `https://www.justwatch.com/images/icon/${iconId}/s100/icon.webp`;
		if (image.src === fallbackUrl) {
			image.hidden = true;
			return;
		}
		image.src = fallbackUrl;
	}
}
