import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmNodeComponent } from './film-node.component';

describe('FilmNodeComponent', () => {
  let component: FilmNodeComponent;
  let fixture: ComponentFixture<FilmNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilmNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilmNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
