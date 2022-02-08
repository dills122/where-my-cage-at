import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { FilmographyRepository, ServiceProviderRepository } from '../repositories';
import { FilmographyService } from '../services/filmography/filmography.service';
import { ServiceProvidersService } from '../services/service-providers/service-providers.service';
import { ThemeService } from '../services/theme/theme-service';

enum Themes {
	dark = 'dark-th',
	light = 'light-th'
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AppComponent implements OnInit, OnDestroy {
	private theme: Themes;
	isDarkTheme: boolean = true;
	subscriptions: Subscription[] = [];
	onDestroyNotifier: Subject<boolean> = new Subject();
	constructor(
		private themeService: ThemeService,
		private serviceProviderService: ServiceProvidersService,
		private filmographyService: FilmographyService,
		private filmographyRepository: FilmographyRepository,
		private serviceProviderRepository: ServiceProviderRepository
	) {
		this.theme = Themes.dark;
	}
	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.onDestroyNotifier.next(true);
		this.onDestroyNotifier.unsubscribe();
	}
	ngOnInit(): void {
		combineLatest([this.filmographyRepository.initialized$, this.serviceProviderRepository.initialized$])
			.pipe(
				takeUntil(this.onDestroyNotifier),
				tap(() => {
					this.subscriptions = [
						this.serviceProviderService.getServiceProviders().subscribe(),
						this.filmographyService.getFilmographyCredits().subscribe()
					];
				})
			)
			.subscribe();
	}

	handleChange(e: { checked: boolean }) {
		this.changeTheme(e.checked);
	}

	changeTheme(isDarkTheme: boolean) {
		this.theme = isDarkTheme ? Themes.dark : Themes.light;
		this.themeService.switchTheme(this.theme.toString());
	}
}
