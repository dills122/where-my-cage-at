import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceIconComponent } from './components/service-icon/service-icon.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
	declarations: [ServiceIconComponent],
	imports: [CommonModule, LazyLoadImageModule],
	exports: [ServiceIconComponent]
})
export class SharedModule {}
