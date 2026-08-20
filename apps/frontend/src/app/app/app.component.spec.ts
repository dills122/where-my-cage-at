import { of } from 'rxjs';
import { FilmographyRepository, ServiceProviderRepository } from '../repositories';
import { FilmographyService } from '../services/filmography/filmography.service';
import { ServiceProvidersService } from '../services/service-providers/service-providers.service';
import { ThemeService } from '../services/theme/theme-service';
import AppComponent from './app.component';

describe('AppComponent', () => {
	let component: AppComponent;
	let themeService: jasmine.SpyObj<ThemeService>;
	let filmographyService: jasmine.SpyObj<FilmographyService>;
	let serviceProvidersService: jasmine.SpyObj<ServiceProvidersService>;

	beforeEach(() => {
		themeService = jasmine.createSpyObj<ThemeService>('ThemeService', ['switchTheme']);
		filmographyService = jasmine.createSpyObj<FilmographyService>('FilmographyService', [
			'getFilmographyCredits'
		]);
		serviceProvidersService = jasmine.createSpyObj<ServiceProvidersService>('ServiceProvidersService', [
			'getServiceProviders'
		]);
		filmographyService.getFilmographyCredits.and.returnValue(of([]));
		serviceProvidersService.getServiceProviders.and.returnValue(of([]));

		component = new AppComponent(
			themeService,
			serviceProvidersService,
			filmographyService,
			{ initialized$: of(true) } as FilmographyRepository,
			{ initialized$: of(true) } as ServiceProviderRepository
		);
	});

	it('loads both catalogues after persistence initializes', () => {
		component.ngOnInit();

		expect(serviceProvidersService.getServiceProviders).toHaveBeenCalledTimes(1);
		expect(filmographyService.getFilmographyCredits).toHaveBeenCalledTimes(1);
	});

	it('switches between the light and dark themes', () => {
		component.handleChange({ checked: false });
		component.handleChange({ checked: true });

		expect(themeService.switchTheme.calls.allArgs()).toEqual([[false], [true]]);
	});
});
