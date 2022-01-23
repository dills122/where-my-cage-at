import { createState, Store } from '@ngneat/elf';
import {
  selectAll,
  selectEntity,
  selectManyByPredicate,
  setEntities,
  withEntities
} from '@ngneat/elf-entities';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import { MovieRecord } from '../models';

const { state, config } = createState(withEntities<MovieRecord>(), withRequestsCache<'filmography'>());

const filmographyStore = new Store({ state, name: 'filmography', config });

export const skipFilmographyWhileCached = createRequestsCacheOperator(filmographyStore);

export class FilmographyRepository {
  credits$ = filmographyStore.pipe(selectAll());
  set(entities: MovieRecord[]) {
    filmographyStore.update(setEntities(entities), updateRequestCache('filmography'));
  }
  getCredit(creditId: number) {
    return filmographyStore.pipe(selectEntity(creditId));
  }
  getAllCreditsByProviderId(providerId: number) {
    return filmographyStore.pipe(
      selectManyByPredicate((credit) => {
        if (!credit.offers) {
          return false;
        }
        return credit.offers.some((offer) => offer.providerId === providerId);
      })
    );
  }
}
