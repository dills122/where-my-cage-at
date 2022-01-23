import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
  serviceId: number;
  constructor(
    private serviceProviderRepository: ServiceProviderRepository,
    private filmographyRepository: FilmographyRepository,
    private route: ActivatedRoute
  ) {
    this.serviceId = Number(this.route.snapshot.paramMap.get('serviceId') || '');
  }
  ngOnInit(): void {
    if (!this.serviceId) {
      return;
    }
    this.serviceProviderRepository.getServiceProviderById(this.serviceId).subscribe((provider) => {
      console.log(provider);
    });
    this.filmographyRepository.getAllCreditsByProviderId(this.serviceId).subscribe((credits) => {
      console.log('Credits::', credits);
    });
  }
}
