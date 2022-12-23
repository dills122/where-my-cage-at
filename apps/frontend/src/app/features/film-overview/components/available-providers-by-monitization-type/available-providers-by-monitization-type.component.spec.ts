import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableProvidersByMonitizationTypeComponent } from './available-providers-by-monitization-type.component';

describe('AvailableProvidersByMonitizationTypeComponent', () => {
  let component: AvailableProvidersByMonitizationTypeComponent;
  let fixture: ComponentFixture<AvailableProvidersByMonitizationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableProvidersByMonitizationTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableProvidersByMonitizationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
