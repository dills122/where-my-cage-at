import { NotFoundError, Tmdb } from '@dills1220/tmdb';
import { Movie } from '../types';
import config from '../../config';

const apiKey = config.tmdb.apiKey;

interface FetchMovieArgs {
	movieId: number;
	imdbId?: string;
	title?: string;
	releaseYear?: number;
}

export default async ({ movieId, imdbId, title, releaseYear }: FetchMovieArgs) => {
	if (!(apiKey != null)) {
		throw Error('Unable to find API key');
	}
	const tmdb = new Tmdb(apiKey);

	try {
		const movie: Movie = await tmdb.getMovie(movieId);
		return movie;
	} catch (error) {
		if (error instanceof NotFoundError) {
			// Prefer stable external-id lookups when JustWatch's catalog ID doesn't map 1:1 to TMDB.
			if (imdbId) {
				try {
					const resolvedId = await tmdb.findId('movie', 'imdb', imdbId);
					const movie: Movie = await tmdb.getMovie(resolvedId);
					return movie;
				} catch (findErr) {
					// Continue to title fallback.
				}
			}

			if (title) {
				try {
					const result = (await tmdb.get('search/movie', {
						query: title,
						year: releaseYear || null,
						include_adult: true
					})) as {
						results?: Array<{ id: number }>;
					};
					const [firstMatch] = result.results || [];
					if (firstMatch?.id) {
						const movie: Movie = await tmdb.getMovie(firstMatch.id);
						return movie;
					}
				} catch (searchErr) {
					// Throw original not-found below.
				}
			}

			console.error('Movie not found, strange..');
			throw error;
		} else {
			console.error(error);
			throw error;
		}
	}
};
