import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceIconComponent } from './components/service-icon/service-icon.component';

@NgModule({
	declarations: [ServiceIconComponent],
	imports: [CommonModule],
	exports: [ServiceIconComponent]
})
export class SharedModule {}
