import { Component, OnInit } from '@angular/core';
import { FilmographyService } from 'src/app/services/filmography/filmography.service';

const services: ServiceInfo[] = [
  {
    serviceId: 15,
    serviceIcon: 'pi-video',
    serviceName: 'Hulu'
  },
  {
    serviceId: 8,
    serviceIcon: 'pi-video',
    serviceName: 'Netflix'
  },
  {
    serviceId: 384,
    serviceIcon: 'pi-video',
    serviceName: 'HBO Max'
  },
  {
    serviceId: 99999,
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
export class HomeComponent implements OnInit {
  readonly cardHeader: string = "Checkout What's Streaming on your Platform";
  frontPageServices = services;
  constructor(private filmographyService: FilmographyService) {}
  ngOnInit(): void {
    this.filmographyService.getFilmographyCredits().subscribe();
  }
}
