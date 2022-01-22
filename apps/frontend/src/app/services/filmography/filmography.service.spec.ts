import { TestBed } from '@angular/core/testing';

import { FilmographyService } from './filmography.service';

describe('FilmographyService', () => {
  let service: FilmographyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilmographyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
