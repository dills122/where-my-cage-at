import { Component, Input, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { buildBaseApuUrlBasedOffEnv } from 'src/app/util/api-url-builder';

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
	constructor(private router: Router) {}
	ngOnInit(): void {
		this.imageUrl = `${this.apiURL}/icons/${this.serviceId}.webp`;
	}

	openServicePage(serviceId: number) {
		this.router.navigate([`/service-overview/${serviceId}`]);
	}
}
