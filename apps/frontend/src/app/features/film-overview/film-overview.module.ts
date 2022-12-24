import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FilmOverviewRoutingModule } from './film-overview-routing.module';
import { CardModule } from 'primeng/card';
import { SharedModule } from '../shared/shared.module';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { AvailableProvidersByMonitizationTypeComponent } from './components/available-providers-by-monitization-type/available-providers-by-monitization-type.component';

@NgModule({
	declarations: [ContainerComponent, AvailableProvidersByMonitizationTypeComponent],
	imports: [CommonModule, CardModule, ChipModule, DividerModule, SharedModule, FilmOverviewRoutingModule]
})
export class FilmOverviewModule {}
