import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';
import { MovieRecord } from 'src/app/models';
import { FilmographyRepository, ServiceProviderRepository } from 'src/app/repositories';
import { MonetizationTypes } from '../../service-provider-overview/service-providers-monetization-types-mapping';

@Component({
	selector: 'app-film-overview-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit, OnDestroy {
	filmId: number;
	filmRecord: MovieRecord | undefined;
	private notifier = new Subject();
	MonetizationTypes = MonetizationTypes;

	constructor(
		private filmographyRepository: FilmographyRepository,
		private serviceProviderRepository: ServiceProviderRepository,
		private route: ActivatedRoute
	) {
		this.filmId = Number(this.route.snapshot.paramMap.get('filmId') || '');
	}
	ngOnDestroy(): void {
		this.notifier.next(true);
		this.notifier.complete();
	}
	ngOnInit(): void {
		this.filmographyRepository
			.getCredit(this.filmId)
			.pipe(
				takeUntil(this.notifier),
				tap(record => {
					this.filmRecord = record;
					console.log(this.filmRecord);
				})
			)
			.subscribe();
	}

	getGenres() {
		return this.filmRecord?.genres;
	}

	getViewingOptionsBasedOnViewingPreference(viewingPreference: MonetizationTypes) {
		const providerIds = this.filmRecord?.offers
			.filter(offer => offer.monetizationType === viewingPreference)
			.map(offer => offer.providerId);
		const providerIdsSet = new Set(providerIds || []);
		return this.serviceProviderRepository.getSubsetOfProviders([...providerIdsSet]);
	}

	//TODO need to make this so each type/resolution link is available somehow
	getFirstUrlForServiceProvider(serviceProviderId: number, monetizationType: MonetizationTypes) {
		const [first] =
			this.filmRecord?.offers
				.filter(
					offer => offer.providerId === serviceProviderId && offer.monetizationType === monetizationType
				)
				.map(offer => offer.urls?.standardWeb) || [];
		return first;
	}

	checkForProvidersWithDesiredMonitizationModel(monetizationType: MonetizationTypes) {
		if (!this.filmRecord?.offers) {
			return false;
		}
		return this.filmRecord?.offers.filter(offer => offer.monetizationType === monetizationType).length > 0;
	}
}
