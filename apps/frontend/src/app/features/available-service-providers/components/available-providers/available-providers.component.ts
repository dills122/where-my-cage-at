import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, map, Observable } from 'rxjs';
import { ServiceProvider } from 'src/app/models';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';

@Component({
	selector: 'app-available-providers',
	templateUrl: './available-providers.component.html',
	styleUrls: ['./available-providers.component.scss']
})
export class AvailableProvidersComponent implements OnInit {
	serviceProvidersWithFilmsAvailable$!: Observable<ServiceProvider[]>;
	constructor(
		private serviceProviderRepository: ServiceProviderRepository,
		private filmographyRepository: FilmographyRepository
	) {}

	ngOnInit(): void {
		this.serviceProvidersWithFilmsAvailable$ = combineLatest([
			this.serviceProviderRepository.serviceProviders$,
			this.filmographyRepository.credits$
		]).pipe(
			filter(([providers, movies]) => providers.length > 0 && movies.length > 0),
			map(([providers, movies]) => {
				return providers
					.filter(provider => {
						return movies.some(movie => {
							if (movie.offers && movie.offers.length > 0) {
								return movie.offers.some(offer => offer.providerId === provider.id);
							}
							return false;
						});
					})
					.sort((first, second) => first.clearName.localeCompare(second.clearName));
			})
		);
	}

	trackServiceProvider(_index: number, serviceProvider: ServiceProvider): number {
		return serviceProvider.id;
	}
}
