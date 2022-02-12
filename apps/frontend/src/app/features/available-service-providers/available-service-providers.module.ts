import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvailableServiceProvidersRoutingModule } from './available-service-providers-routing.module';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from '../shared/shared.module';

import { ContainerComponent } from './container/container.component';
import { AvailableProvidersComponent } from '../available-service-providers/components/available-providers/available-providers.component';

@NgModule({
	declarations: [ContainerComponent, AvailableProvidersComponent],
	imports: [
		CommonModule,
		CardModule,
		PanelModule,
		ButtonModule,
		SharedModule,
		AvailableServiceProvidersRoutingModule
	]
})
export class AvailableServiceProvidersModule {}
