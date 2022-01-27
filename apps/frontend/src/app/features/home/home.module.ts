import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './container/home.component';
import { HomeRoutingModule } from './home-routing.module';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ServiceButtonNodeComponent } from './components/service-button-node/service-button-node.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [HomeComponent, ServiceButtonNodeComponent],
	imports: [CommonModule, HomeRoutingModule, ButtonModule, CardModule, DividerModule, SharedModule]
})
export class HomeModule {}
