import { createState, Store } from '@ngneat/elf';
import {
	selectAllEntities,
	selectEntity,
	selectManyByPredicate,
	setEntities,
	withEntities
} from '@ngneat/elf-entities';
import { EMPTY, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MovieRecord } from '../models';

const { state, config } = createState(withEntities<MovieRecord>());

const filmographyStore = new Store({ state, name: 'filmography', config });

export class FilmographyRepository {
	initialized$ = of(true);
	credits$ = filmographyStore.pipe(selectAllEntities());
	set(entities: MovieRecord[]) {
		filmographyStore.update(setEntities(entities));
	}
	getCredit(creditId: number) {
		return filmographyStore.pipe(
			selectEntity(creditId),
			switchMap(credit => {
				if (credit === undefined) {
					return EMPTY;
				}
				return of(credit);
			})
		);
	}
	getAllCreditsByProviderId(providerId: number) {
		return filmographyStore.pipe(
			selectManyByPredicate(credit => {
				if (!credit.offers) {
					return false;
				}
				return credit.offers.some(offer => offer.providerId === providerId);
			})
		);
	}
}
