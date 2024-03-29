import { Tmdb, NotFoundError } from '@dills1220/tmdb';
import { CastCredit, MovieCreditsListsByRole } from '../types';
import config from '../../config';

const apiKey = config.tmdb.apiKey;

const personId = 2963;

export default async (): Promise<CastCredit[]> => {
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
			throw error;
		} else {
			console.error(error);
			throw error;
		}
	}
};
