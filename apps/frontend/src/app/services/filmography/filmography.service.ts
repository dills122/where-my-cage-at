import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { MovieRecord } from 'src/app/models';
import { tap } from 'rxjs/operators';
import { FilmographyRepository } from 'src/app/repositories';

@Injectable({
  providedIn: 'root'
})
export class FilmographyService {
  private apiURL = isDevMode() ? 'http://localhost:3000' : 'https://wheremycageat.com';
  constructor(private http: HttpClient, private filmographyRepository: FilmographyRepository) {}

  getFilmographyCredits() {
    return this.http
      .get<MovieRecord[]>(`${this.apiURL}/filmography`)
      .pipe(tap((records) => this.filmographyRepository.set(records)));
  }
}
