import { Component, Input, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { buildBaseApuUrlBasedOffEnv } from 'src/app/util/api-url-builder';

@Component({
	selector: 'app-service-icon',
	templateUrl: './service-icon.component.html',
	styleUrls: ['./service-icon.component.scss']
})
export class ServiceIconComponent implements OnInit {
	private apiURL = buildBaseApuUrlBasedOffEnv(isDevMode());
	imageUrl: string = '';
	@Input() serviceId: number = -1;
	@Input() serviceName: string = '';
	@Input() externalUrl?: string;

	constructor(private router: Router) {}
	ngOnInit(): void {
		this.imageUrl = `${this.apiURL}/icons/${this.serviceId}.webp`;
	}

	openUrl() {
		if (!this.externalUrl) {
			return this.openServicePage(this.serviceId);
		}
		window.open(this.externalUrl, '_blank');
	}

	openServicePage(serviceId: number) {
		this.router.navigate([`/service-provider-overview/${serviceId}`]);
	}
}
