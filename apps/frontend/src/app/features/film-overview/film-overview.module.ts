import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FilmOverviewRoutingModule } from './film-overview-routing.module';

@NgModule({
	declarations: [ContainerComponent],
	imports: [CommonModule, FilmOverviewRoutingModule]
})
export class FilmOverviewModule {}
