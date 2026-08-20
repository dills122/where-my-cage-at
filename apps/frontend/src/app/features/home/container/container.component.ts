import { Component } from '@angular/core';
import { ServiceInfo, services } from '../services';

@Component({
	selector: 'app-home-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss'],
	standalone: false
})
export class HomeComponent {
	readonly cardHeader: string = 'Check out what’s streaming on your platform';
	highlightedServices: ServiceInfo[] = services;
	constructor() {}
}
