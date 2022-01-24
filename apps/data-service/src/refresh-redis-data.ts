import WTW, { Offers } from '@dills1220/wtw';
import * as dotenv from 'dotenv';
import { FullClient, MovieRecord, ServiceProvider } from 'redis-sdk';
import FetchMovieData from './gathers/fetch-movie-details';
import config from '../config';

//TODO look into this, not working correctly
dotenv.config({ path: __dirname + '/.env' });

const JustWatchPersonId = Number(process.env.JW_PERSON_ID || config.JustWatchPersonId);
const RedisPort = process.env.REDIS_PORT || '6379';

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

const movies: MovieRecord[] = [];

export default async () => {
  try {
    console.log(`Starting Redis data refresh at: ${new Date().toISOString()}`);
    const wtw = new WTW();
    const creditRecords = await wtw.getPersonsFilmography({
      personId: JustWatchPersonId
    });
    console.log('Retrieved Credit Records');
    const serviceProviders = await wtw.getProviders();
    console.log('Retrieved Service Providers');
    console.log('Beginning iteration over movie credits');
    // console.log(JSON.stringify(creditRecords, null, 4));
    for (const record of creditRecords) {
      const { scoring = [], title, offers, objectType } = record;
      const { value: tmdbId = 0 } =
        scoring.find((obj) => {
          return obj.providerType === 'tmdb:id';
        }) || {};
      console.log(`Movie: ${title}: ${objectType}, tmdb: ${tmdbId}`);

      const movieObject = await getAdditionalMovieData(tmdbId, title, offers);
      if (!movieObject) {
        continue;
      }
      console.log(`Adding Movie to list to update: ${tmdbId}`);
      movies.push(movieObject);
    }
    console.log('Finished movie data construction, ready to update Redis');
    await updateEntireRedisInstance(movies, serviceProviders);
    console.log(`Finished Redis Data Refresh at: ${new Date().toISOString()}`);
    if (failures.totalFailed > 0) {
      console.warn(`Finished Redis Data Refresh with failed records: ${failures.failedMovies.join()}`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

async function updateEntireRedisInstance(movies: MovieRecord[], serviceProviders: ServiceProvider[]) {
  const client = new FullClient({
    host: 'localhost',
    port: RedisPort
  });
  try {
    await client.connect();
    console.log('Updating Movie Catalog');
    await client.updateMovieCatalog(movies);
    console.log('Updating Service Providers');
    await client.updateServiceProviders(serviceProviders);
    await client.disconnect();
  } catch (err) {
    await client.disconnect();
    throw err;
  }
}

async function getAdditionalMovieData(movieId: number, title: string, offers: Offers[]) {
  try {
    if (movieId === 0) {
      throw Error('Error with data being pulled, id should always be defined');
    }
    const {
      title,
      popularity,
      releaseDate,
      posterPath,
      shortDescription,
      cinemaReleaseDate,
      ageCertification,
      runtime,
      genres,
      imdbId,
      originalLanguage
    } = await FetchMovieData(movieId);
    return {
      id: movieId,
      title,
      offers,
      poster: posterPath,
      tmdbPopularity: popularity,
      localizedReleaseDate: releaseDate,
      objectType: 'movie',
      originalReleaseYear: new Date(releaseDate).getFullYear(),
      shortDescription,
      ageCertification,
      cinemaReleaseDate,
      runtime,
      imdbId,
      originalLanguage,
      genres
    } as MovieRecord;
  } catch (err) {
    console.log(`Failed getting data for movie: ${movieId}`);
    console.warn(err);
    failures.totalFailed++;
    failures.failedMovies.push({
      title,
      id: movieId
    });
    return null;
  }
}
