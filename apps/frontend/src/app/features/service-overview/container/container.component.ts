import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceProviderRepository } from 'src/app/repositories';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {
  constructor(private serviceProviderRepository: ServiceProviderRepository, private route: ActivatedRoute) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('serviceId');
    if (!id) {
      return;
    }
    this.serviceProviderRepository.getServiceProviderById(Number(id)).subscribe((provider) => {
      console.log(provider);
    });
  }
}
