import { createState, Store } from '@ngneat/elf';
import {
	selectAllEntities,
	selectEntity,
	selectManyByPredicate,
	setEntities,
	withEntities,
	upsertEntities
} from '@ngneat/elf-entities';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import { EMPTY, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MovieRecord } from '../models';

const storeName = 'filmography';

const { state, config } = createState(withEntities<MovieRecord>(), withRequestsCache<'filmography'>());

const filmographyStore = new Store({ state, name: storeName, config });

export const filmographyPersist = persistState(filmographyStore, {
	key: storeName,
	storage: localStorageStrategy
});

export const skipFilmographyWhileCached = createRequestsCacheOperator(filmographyStore);

export class FilmographyRepository {
	initialized$ = filmographyPersist.initialized$;
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
	update(entities: MovieRecord[]) {
		filmographyStore.update(
			updateRequestCache(storeName, {
				value: 'partial',
				ttl: 43200000 //12 hours
			}),
			upsertEntities(entities)
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
