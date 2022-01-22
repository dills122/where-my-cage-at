import { createState, Store } from '@ngneat/elf';
import { selectAll, selectEntity, setEntities, withEntities } from '@ngneat/elf-entities';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import { MovieRecord } from '../models';

interface FilmographyCredit extends MovieRecord {}

const { state, config } = createState(withEntities<FilmographyCredit>(), withRequestsCache<'filmography'>());

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
}
