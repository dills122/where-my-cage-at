import { Component } from '@angular/core';

const services = [
	{
		serviceId: 15,
		serviceIcon: 'pi-video',
		serviceName: 'Hulu'
	},
	{
		serviceIcon: 'pi-video',
		serviceName: 'Netflix',
		serviceId: 8
	},
	{
		serviceIcon: 'pi-video',
		serviceName: 'HBO Max',
		serviceId: 384
	},
	{
		serviceIcon: 'pi-ellipsis-h',
		serviceName: 'See More',
		serviceId: 99999
	}
];

interface ServiceInfo {
	serviceName: string;
	serviceIcon: string;
	serviceId: number;
}

@Component({
	selector: 'app-home-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss']
})
export class HomeComponent {
	readonly cardHeader: string = "Checkout What's Streaming on your Platform";
	highlightedServices: ServiceInfo[] = services;
	constructor() {}
	// ngOnInit(): void {
	//   from([8, 15, 384])
	//     .pipe(
	//       mergeMap((id) => {
	//         return this.serviceProviderRepository.getServiceProviderById(id).pipe(
	//           map((provider) => {
	//             const additionalData = services.find(
	//               (service) => service.serviceName.toLowerCase() === provider.clearName.toLowerCase()
	//             );
	//             return {
	//               serviceId: provider.id,
	//               serviceName: provider.clearName,
	//               serviceIcon: additionalData?.serviceIcon
	//             } as ServiceInfo;
	//           })
	//         );
	//       })
	//     )
	//     .subscribe((service) => this.highlightedServices.push(service));
	// }
}
