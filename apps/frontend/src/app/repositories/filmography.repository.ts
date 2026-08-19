import { createState, Store } from '@ngneat/elf';
import {
	selectAllEntities,
	selectEntity,
	selectManyByPredicate,
	setEntities,
	withEntities
} from '@ngneat/elf-entities';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import { EMPTY, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MovieRecord } from '../models';

const storeName = 'filmography';

const { state, config } = createState(withEntities<MovieRecord>(), withRequestsCache<'filmography'>());

const filmographyStore = new Store({ state, name: storeName, config });

export const skipFilmographyWhileCached = createRequestsCacheOperator(filmographyStore);

export class FilmographyRepository {
	initialized$ = of(true);
	credits$ = filmographyStore.pipe(selectAllEntities());
	set(entities: MovieRecord[]) {
		filmographyStore.update(
			updateRequestCache(storeName, {
				value: 'full',
				ttl: 43200000 //12 hours
			}),
			setEntities(entities)
		);
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
