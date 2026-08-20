import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
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
				preset: Aura,
				options: { darkModeSelector: '.app-dark' }
			}
		})
	]
}).catch(err => console.error(err));
