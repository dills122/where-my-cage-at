import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceOverviewRoutingModule } from './service-overview-routing.module';
import { ContainerComponent } from './container/container.component';


@NgModule({
  declarations: [
    ContainerComponent
  ],
  imports: [
    CommonModule,
    ServiceOverviewRoutingModule
  ]
})
export class ServiceOverviewModule { }
