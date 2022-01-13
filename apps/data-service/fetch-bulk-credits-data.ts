import * as dotenv from 'dotenv';

import { Tmdb, NotFoundError } from '@dills1220/tmdb';
import { MovieCreditsListsByRole } from './types';

dotenv.config({ path: __dirname + '/.env' });

const apiKey = process.env.TMDB_KEY;

const personId = 2963;

export default async () => {
  if (!(apiKey != null)) {
    throw Error('Unable to find API key');
  }
  const tmdb = new Tmdb(apiKey);

  try {
    const { cast }: MovieCreditsListsByRole = await tmdb.getPersonMovieCredits(personId);
    if (cast.length === 0) {
      console.error('No records found, strange..');
      throw Error('No credits found');
    }
    return cast;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error('Person not found, strange..');
      return;
    } else {
      console.error(error);
      throw error;
    }
  }
};
