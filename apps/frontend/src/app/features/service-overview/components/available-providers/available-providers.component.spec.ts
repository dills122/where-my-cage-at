import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableProvidersComponent } from './available-providers.component';

describe('AvailableProvidersComponent', () => {
  let component: AvailableProvidersComponent;
  let fixture: ComponentFixture<AvailableProvidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableProvidersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
