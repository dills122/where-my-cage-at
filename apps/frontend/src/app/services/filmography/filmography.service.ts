import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CATALOGUE_DATA_SOURCE, CatalogueDataSource } from 'src/app/data-access';
import { FilmographyRepository } from 'src/app/repositories';

@Injectable({
	providedIn: 'root'
})
export class FilmographyService {
	constructor(
		@Inject(CATALOGUE_DATA_SOURCE) private readonly dataSource: CatalogueDataSource,
		private filmographyRepository: FilmographyRepository
	) {}

	getFilmographyCredits() {
		return this.dataSource.getFilmography().pipe(tap(records => this.filmographyRepository.set(records)));
	}

	getFilmographyCredit(creditId: number) {
		return this.dataSource.getFilmographyCredit(creditId);
	}
}
