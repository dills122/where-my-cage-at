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
		loadChildren: () => import('./features/home/home.module').then((m) => m.HomeModule)
	},
	{
		path: 'service-overview/:serviceId',
		loadChildren: () =>
			import('./features/service-overview/service-overview.module').then((m) => m.ServiceOverviewModule)
	},
	{
		path: 'film-overview/:filmId',
		loadChildren: () =>
			import('./features/film-overview/film-overview.module').then((m) => m.FilmOverviewModule)
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
