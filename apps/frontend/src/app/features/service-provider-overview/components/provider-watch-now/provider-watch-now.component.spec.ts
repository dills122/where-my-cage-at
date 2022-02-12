import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderWatchNowComponent } from './provider-watch-now.component';

describe('ProviderWatchNowComponent', () => {
  let component: ProviderWatchNowComponent;
  let fixture: ComponentFixture<ProviderWatchNowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderWatchNowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderWatchNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
