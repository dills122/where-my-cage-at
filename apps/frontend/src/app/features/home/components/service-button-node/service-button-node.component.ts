import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-button-node',
  templateUrl: './service-button-node.component.html',
  styleUrls: ['./service-button-node.component.scss']
})
export class ServiceButtonNodeComponent {
  @Input() serviceName: string = '';
  @Input() serviceIcon: string = '';
  @Input() serviceId: number = -1;

  constructor(private router: Router) {}

  openServicePage(serviceId: number) {
    this.router.navigate([`/service-overview/${serviceId}`]);
  }
}
