import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import AppComponent from './app/app.component';
import { AppRoutingModule } from './app-routing.module';

import { ToggleButtonModule } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';

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
