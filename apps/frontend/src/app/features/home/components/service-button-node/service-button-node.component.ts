import { Component, Input, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { buildBaseApuUrlBasedOffEnv } from 'src/app/util/api-url-builder';
import { SEE_MORE_SERVICE_ID } from '../../services';

@Component({
	selector: 'app-service-button-node',
	templateUrl: './service-button-node.component.html',
	styleUrls: ['./service-button-node.component.scss']
})
export class ServiceButtonNodeComponent implements OnInit {
	@Input() serviceName: string = '';
	@Input() serviceIcon: string = '';
	@Input() serviceId: number = -1;
	private apiURL = buildBaseApuUrlBasedOffEnv(isDevMode());
	imageUrl: string = '';
	SEE_MORE_SERVICE_ID = SEE_MORE_SERVICE_ID;
	constructor(private router: Router) {}
	ngOnInit(): void {
		this.imageUrl = `${this.apiURL}/icons/${this.serviceId}.webp`;
	}

	openServicePage(serviceId: number) {
		if (this.serviceId === this.SEE_MORE_SERVICE_ID) {
			this.router.navigate(['/available-service-providers']);
		} else {
			this.router.navigate([`/service-provider-overview/${serviceId}`]);
		}
	}
}
