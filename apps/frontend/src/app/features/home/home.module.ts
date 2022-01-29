import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './container/container.component';
import { HomeRoutingModule } from './home-routing.module';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ServiceButtonNodeComponent } from './components/service-button-node/service-button-node.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { FilmSearchComponent } from './components/film-search/film-search.component';

@NgModule({
	declarations: [HomeComponent, ServiceButtonNodeComponent, FilmSearchComponent],
	imports: [
		CommonModule,
		HomeRoutingModule,
		ButtonModule,
		CardModule,
		AutoCompleteModule,
		SharedModule,
		FormsModule
	]
})
export class HomeModule {}
