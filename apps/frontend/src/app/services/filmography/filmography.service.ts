import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MovieRecord } from 'src/app/models';
import { FilmographyRepository, skipFilmographyWhileCached } from 'src/app/repositories';

@Injectable({
  providedIn: 'root'
})
export class FilmographyService {
  private apiURL = isDevMode() ? 'http://localhost:3000' : 'https://wheremycageat.com';
  constructor(private http: HttpClient, private filmographyRepository: FilmographyRepository) {}

  getFilmographyCredits() {
    return this.http.get<MovieRecord[]>(`${this.apiURL}/filmography`).pipe(
      tap(this.filmographyRepository.set),
      skipFilmographyWhileCached('filmography', {
        value: 'full'
      })
    );
  }
}
