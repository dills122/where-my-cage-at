import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceButtonNodeComponent } from './service-button-node.component';

describe('ServiceButtonNodeComponent', () => {
	let component: ServiceButtonNodeComponent;
	let fixture: ComponentFixture<ServiceButtonNodeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ServiceButtonNodeComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ServiceButtonNodeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
