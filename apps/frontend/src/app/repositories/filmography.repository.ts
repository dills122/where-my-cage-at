import { createState, Store } from '@ngneat/elf';
import { selectAll, selectEntity, setEntities, withEntities } from '@ngneat/elf-entities';
import { MovieRecord } from '../models';

interface FilmographyCredit extends MovieRecord {}

const { state, config } = createState(withEntities<FilmographyCredit>());

const filmographyStore = new Store({ state, name: 'filmography', config });

export class FilmographyRepository {
  credits$ = filmographyStore.pipe(selectAll());
  set(entities: MovieRecord[]) {
    return filmographyStore.update(setEntities(entities));
  }
  getCredit(creditId: number) {
    return filmographyStore.pipe(selectEntity(creditId));
  }
}
