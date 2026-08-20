import { Component } from '@angular/core';

@Component({
	selector: 'app-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss'],
	standalone: false
})
export class ContainerComponent {
	readonly serviceProvidersOverviewCardHeader: string = 'All available providers';
}
