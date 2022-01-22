import { Component } from '@angular/core';

const services: ServiceInfo[] = [
  {
    serviceId: 1,
    serviceIcon: 'pi-video',
    serviceName: 'Hulu'
  },
  {
    serviceId: 2,
    serviceIcon: 'pi-video',
    serviceName: 'Netflix'
  },
  {
    serviceId: 3,
    serviceIcon: 'pi-video',
    serviceName: 'HBO Max'
  },
  {
    serviceId: 4,
    serviceIcon: 'pi-ellipsis-h',
    serviceName: 'See More'
  }
];

interface ServiceInfo {
  serviceName: string;
  serviceIcon: string;
  serviceId: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly cardHeader: string = "Checkout What's Streaming on your Platform";
  frontPageServices = services;
  constructor() {}
}
