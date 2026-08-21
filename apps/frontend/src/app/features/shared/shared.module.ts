import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ServiceIconComponent } from './components/service-icon/service-icon.component';
import { MoviePosterComponent } from './components/movie-poster/movie-poster.component';

@NgModule({
	declarations: [ServiceIconComponent, MoviePosterComponent],
	imports: [CommonModule, NgOptimizedImage],
	exports: [ServiceIconComponent, MoviePosterComponent]
})
export class SharedModule {}
