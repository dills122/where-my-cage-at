import { NotFoundError, Tmdb } from '@dills1220/tmdb';
import * as dotenv from 'dotenv';
import { Movie } from '../types';

dotenv.config({ path: __dirname + '/.env' });

// const apiKey = process.env.TMDB_KEY;
const apiKey = '2f6f061b137d85ddfebf0ab5c37b262d';

export default async (movieId: number) => {
  if (!(apiKey != null)) {
    throw Error('Unable to find API key');
  }
  const tmdb = new Tmdb(apiKey);

  try {
    const movie: Movie = await tmdb.getMovie(movieId);
    return movie;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error('Movie not found, strange..');
      throw error;
    } else {
      console.error(error);
      throw error;
    }
  }
};
