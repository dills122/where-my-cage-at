import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { AppRoutingModule } from './app-routing.module';
import AppComponent from './app/app.component';
import { FilmographyRepository, ServiceProviderRepository } from './repositories';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),
		FormsModule,

		ToggleButtonModule,
		ButtonModule,

		// app
		AppRoutingModule
	],
	providers: [FilmographyRepository, ServiceProviderRepository],
	bootstrap: [AppComponent]
})
export class AppModule {}
