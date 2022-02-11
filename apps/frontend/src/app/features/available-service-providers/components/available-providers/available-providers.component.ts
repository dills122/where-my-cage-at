import { Component, OnInit } from '@angular/core';
import { map, Observable, withLatestFrom } from 'rxjs';
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
		this.serviceProvidersWithFilmsAvailable$ = this.serviceProviderRepository.serviceProviders$.pipe(
			withLatestFrom(this.filmographyRepository.credits$),
			map(([providers, movies]) => {
				return providers.filter(provider => {
					return movies.some(movie => {
						if (movie.offers && movie.offers.length > 0) {
							return movie.offers.some(offer => offer.providerId === provider.id);
						}
						return false;
					});
				});
			})
		);
	}
}
