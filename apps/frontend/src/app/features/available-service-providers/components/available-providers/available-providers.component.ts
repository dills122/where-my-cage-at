import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, map, Observable } from 'rxjs';
import { ServiceProvider } from 'src/app/models';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';
import { buildProviderCatalogue, ProviderCatalogue } from './provider-groups';

@Component({
	selector: 'app-available-providers',
	templateUrl: './available-providers.component.html',
	styleUrls: ['./available-providers.component.scss'],
	standalone: false
})
export class AvailableProvidersComponent implements OnInit {
	providerCatalogue$!: Observable<ProviderCatalogue>;
	constructor(
		private serviceProviderRepository: ServiceProviderRepository,
		private filmographyRepository: FilmographyRepository
	) {}

	ngOnInit(): void {
		this.providerCatalogue$ = combineLatest([
			this.serviceProviderRepository.serviceProviders$,
			this.filmographyRepository.credits$
		]).pipe(
			filter(([providers, movies]) => providers.length > 0 && movies.length > 0),
			map(([providers, movies]) => {
				const providersWithFilms = providers.filter(provider => {
					return movies.some(movie => {
						if (movie.offers && movie.offers.length > 0) {
							return movie.offers.some(offer => offer.providerId === provider.id);
						}
						return false;
					});
				});
				return buildProviderCatalogue(providersWithFilms);
			})
		);
	}

	trackServiceProvider(_index: number, serviceProvider: ServiceProvider): number {
		return serviceProvider.id;
	}
}
