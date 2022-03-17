import { FullClient } from '../src/client';
import { ReadOnlyClient } from '../src/readonly-client';
import { MovieRecord } from '../src/data-types';
import assert from 'assert';

// docker run -d -p 6379:6379 --name redis-redisjson redislabs/rejson:latest

(async () => {
	const testFilms: MovieRecord[] = [
		{
			id: 0,
			imdbId: '',
			title: '',
			poster: '',
			originalReleaseYear: 0,
			tmdbPopularity: 0,
			runtime: 0,
			originalLanguage: '',
			ageCertification: 'string',
			cinemaReleaseDate: 'string',
			shortDescription: 'string',
			objectType: 'movie',
			localizedReleaseDate: 'string',
			offers: [],
			genres: []
		},
		{
			id: 1,
			imdbId: '',
			title: '',
			poster: '',
			originalReleaseYear: 1,
			tmdbPopularity: 1,
			runtime: 1,
			originalLanguage: '',
			ageCertification: 'string',
			cinemaReleaseDate: 'string',
			shortDescription: 'string',
			objectType: 'movie',
			localizedReleaseDate: 'string',
			offers: [],
			genres: []
		},
		{
			id: 2,
			imdbId: '',
			title: '',
			poster: '',
			originalReleaseYear: 2,
			tmdbPopularity: 2,
			runtime: 2,
			originalLanguage: '',
			ageCertification: 'string',
			cinemaReleaseDate: 'string',
			shortDescription: 'string',
			objectType: 'movie',
			localizedReleaseDate: 'string',
			offers: [],
			genres: []
		}
	];

	try {
		const client = new FullClient({
			host: 'localhost',
			port: '6379'
		});
		await client.connect();

		for (const i of [0, 1, 2]) {
			console.log(`Run: ${i}`);
			await client.updateMovieCatalog(testFilms);
		}
		const readonlyClient = new ReadOnlyClient({
			host: 'localhost',
			port: '6379'
		});
		await readonlyClient.connect();
		const movies = await readonlyClient.getMovieCatalog();

		assert.deepEqual(movies, testFilms);

		await readonlyClient.disconnect();
		await client.disconnect();

		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();
