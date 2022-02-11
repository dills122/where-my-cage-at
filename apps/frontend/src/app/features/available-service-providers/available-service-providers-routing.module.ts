import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContainerComponent } from './container/container.component';

const routes: Routes = [
	{
		path: '',
		component: ContainerComponent,
		data: { title: 'Available Service Providers' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AvailableServiceProvidersRoutingModule {}
