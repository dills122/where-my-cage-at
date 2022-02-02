import { Component, Input, isDevMode, OnInit } from '@angular/core';
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
	constructor() {}
	ngOnInit(): void {
		this.imageUrl = `${this.apiURL}/icons/${this.serviceId}.webp`;
	}
}
