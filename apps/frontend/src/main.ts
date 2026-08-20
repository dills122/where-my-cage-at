import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { AppRoutingModule } from './app/app-routing.module';
import AppComponent from './app/app/app.component';
import { HeadersInterceptor } from './app/interceptors/headers/headers.interceptor';
import { FilmographyRepository, ServiceProviderRepository } from './app/repositories';
import { LocalStorageService } from './app/services/local-storage/local-storage.service';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

const CageTheme = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{violet.50}',
			100: '{violet.100}',
			200: '{violet.200}',
			300: '{violet.300}',
			400: '{violet.400}',
			500: '{violet.500}',
			600: '{violet.600}',
			700: '{violet.700}',
			800: '{violet.800}',
			900: '{violet.900}',
			950: '{violet.950}'
		}
	}
});

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(AppRoutingModule),
		FilmographyRepository,
		ServiceProviderRepository,
		provideAppInitializer(() => inject(LocalStorageService).removeLegacyCatalogueEntries()),
		{ provide: HTTP_INTERCEPTORS, useClass: HeadersInterceptor, multi: true },
		provideHttpClient(withInterceptorsFromDi()),
		providePrimeNG({
			theme: {
				preset: CageTheme,
				options: { darkModeSelector: '.app-dark' }
			}
		})
	]
}).catch(err => console.error(err));
