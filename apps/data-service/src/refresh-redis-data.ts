import WTW, { ObjectSearchResult } from '@dills1220/wtw';
import * as dotenv from 'dotenv';
import { FullClient, MovieRecord, ServiceProvider } from 'redis-sdk';
import config from '../config';
import FetchMovieData from './gathers/fetch-movie-details';
import { Movie } from './types';
import { getRedisHostName } from './util';

dotenv.config({ path: __dirname + '/../.env' });

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
		console.log('Retrieved Acting Credit Records');

		const serviceProviders = await wtw.getProviders();
		console.log('Retrieved Streaming Service Providers');

		console.log('Beginning iteration over movie credits', creditRecords.length);
		await iterateThroughCredits(creditRecords);

		console.log('Finished movie data construction, ready to update Redis');

		console.log(`Running totals, movies: ${movies.length}, service providers: ${serviceProviders.length}`);
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

function getTmdbIdFromObjectSearchResult(record: ObjectSearchResult) {
	const { scoring = [] } = record;
	const { value: tmdbId = 0 } =
		scoring.find(obj => {
			return obj.providerType === 'tmdb:id';
		}) || {};
	return tmdbId;
}

async function iterateThroughCredits(creditRecords: ObjectSearchResult[]) {
	for (const record of creditRecords) {
		const { title, objectType } = record;
		const tmdbId = getTmdbIdFromObjectSearchResult(record);
		try {
			console.log(`Movie: ${title}: ${objectType}, tmdb: ${tmdbId}`);
			const movieObject = await getAdditionalMovieData(tmdbId);
			console.log(`Adding Movie to list to update: ${tmdbId}`);
			const movieRecord = mergeMovieData(record, movieObject);
			movies.push(movieRecord);
		} catch (err) {
			addFailedRecord({
				movieId: tmdbId,
				title,
				err
			});
			continue;
		}
	}
}

async function updateEntireRedisInstance(movies: MovieRecord[], serviceProviders: ServiceProvider[]) {
	const redisHostName = getRedisHostName();
	const client = new FullClient({
		host: redisHostName,
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

async function getAdditionalMovieData(movieId: number) {
	if (movieId === 0) {
		throw Error('Error with data being pulled, id should always be defined');
	}
	return await FetchMovieData(movieId);
}

function mergeMovieData(record: ObjectSearchResult, additionalMovieData: Movie): MovieRecord {
	const { title, offers, localizedReleaseDate, poster, originalReleaseYear } = record;
	const {
		id,
		posterPath,
		popularity,
		releaseDate,
		ageCertification,
		cinemaReleaseDate,
		runtime,
		imdbId,
		originalLanguage,
		genres
	} = additionalMovieData;
	return {
		id,
		title,
		offers,
		poster: posterPath || poster,
		tmdbPopularity: popularity,
		localizedReleaseDate: releaseDate || localizedReleaseDate,
		objectType: 'movie',
		originalReleaseYear: originalReleaseYear || new Date(releaseDate).getFullYear(),
		shortDescription: record.shortDescription || additionalMovieData.shortDescription,
		ageCertification,
		cinemaReleaseDate: cinemaReleaseDate,
		runtime,
		imdbId,
		originalLanguage,
		genres
	} as MovieRecord;
}

function addFailedRecord({ movieId, err, title }) {
	console.log(`Failed getting data for movie: ${movieId}`);
	console.warn(err);
	failures.totalFailed++;
	failures.failedMovies.push({
		title,
		id: movieId
	});
}
