import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceOverviewRoutingModule } from './service-provider-overview-routing.module';
import { ContainerComponent } from './container/container.component';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { FilmNodeComponent } from './components/film-node/film-node.component';
import { SharedModule } from '../shared/shared.module';
import { ProviderWatchNowComponent } from './components/provider-watch-now/provider-watch-now.component';

@NgModule({
	declarations: [ContainerComponent, FilmNodeComponent, ProviderWatchNowComponent],
	imports: [
		CommonModule,
		ChipModule,
		ServiceOverviewRoutingModule,
		CardModule,
		DividerModule,
		PanelModule,
		ButtonModule,
		SharedModule
	]
})
export class ServiceProviderOverviewModule {}
