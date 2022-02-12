import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full'
	},
	{
		path: 'home',
		loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
	},
	{
		path: 'available-service-providers',
		loadChildren: () =>
			import('./features/available-service-providers/available-service-providers.module').then(
				m => m.AvailableServiceProvidersModule
			)
	},
	{
		path: 'service-provider-overview/:serviceId',
		loadChildren: () =>
			import('./features/service-provider-overview/service-provider-overview.module').then(
				m => m.ServiceProviderOverviewModule
			)
	},
	{
		path: 'film-overview/:filmId',
		loadChildren: () =>
			import('./features/film-overview/film-overview.module').then(m => m.FilmOverviewModule)
	},
	{
		path: '**',
		redirectTo: 'home'
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			scrollPositionRestoration: 'enabled',
			preloadingStrategy: PreloadAllModules,
			relativeLinkResolution: 'legacy'
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}
