import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MovieRecord, ServiceProvider } from 'src/app/models';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {
  readonly cardHeader: string = 'Service Provider Overview:';
  serviceId: number;
  serviceProviderData$: Observable<ServiceProvider>;
  filmsAvailable$: Observable<MovieRecord[]>;
  constructor(
    private serviceProviderRepository: ServiceProviderRepository,
    private filmographyRepository: FilmographyRepository,
    private route: ActivatedRoute
  ) {
    this.serviceId = Number(this.route.snapshot.paramMap.get('serviceId') || '');
    this.serviceProviderData$ = this.serviceProviderRepository.getServiceProviderById(this.serviceId);
    this.filmsAvailable$ = this.filmographyRepository.getAllCreditsByProviderId(this.serviceId);
  }
}
