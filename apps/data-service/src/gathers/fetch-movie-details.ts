import { NotFoundError, Tmdb } from '@dills1220/tmdb';
import { Movie } from '../types';
import config from '../../config';

const apiKey = config.tmdb.apiKey;

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
