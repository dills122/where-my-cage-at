import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceOverviewRoutingModule } from './service-overview-routing.module';
import { ContainerComponent } from './container/container.component';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { FilmNodeComponent } from './components/film-node/film-node.component';

@NgModule({
  declarations: [ContainerComponent, FilmNodeComponent],
  imports: [CommonModule, ServiceOverviewRoutingModule, CardModule, PanelModule, ButtonModule]
})
export class ServiceOverviewModule {}
