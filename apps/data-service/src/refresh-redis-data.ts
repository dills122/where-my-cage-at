import WTW, { Offers } from '@dills1220/wtw';
import * as dotenv from 'dotenv';
import FetchMovieData from './gathers/fetch-movie-details';

const JustWatchPersonId = Number(process.env.JW_PERSON_ID);

dotenv.config({ path: __dirname + '/.env' });

interface UpdateFailures {
  totalFailed: number;
  failedMovies: {
    title: string;
    id: number;
  }[];
}

const failures: UpdateFailures = {
  totalFailed: 0,
  failedMovies: []
};

export default async () => {
  try {
    const wtw = new WTW();
    const movieRecords = await wtw.getPersonsFilmography({
      personId: JustWatchPersonId
    });
    for (const record of movieRecords) {
      const { scoring, title, offers } = record;
      const { value: tmdbId = 0 } =
        scoring.find((obj) => {
          return obj.providerType === 'tmdb:id';
        }) || {};
      await getAndUpdateMovieDataFromCreditInfo(tmdbId, title, offers);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

async function getAndUpdateMovieDataFromCreditInfo(movieId: number, title: string, offers: Offers[]) {
  try {
    const movie = await FetchMovieData(movieId);
    const movieRecord = {
      ...movie,
      offers
    };
    //TODO need to implement redis client updates here
  } catch (err) {
    console.warn(err);
    failures.totalFailed++;
    failures.failedMovies.push({
      title,
      id: movieId
    });
  }
}
