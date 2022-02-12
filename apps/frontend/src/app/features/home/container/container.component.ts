import { Component } from '@angular/core';
import { ServiceInfo, services } from '../services';

@Component({
	selector: 'app-home-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss']
})
export class HomeComponent {
	readonly cardHeader: string = "Checkout What's Streaming on your Platform";
	highlightedServices: ServiceInfo[] = services;
	constructor() {}
}
