import WTW, { ObjectSearchResult } from '@dills1220/wtw/index';
import * as dotenv from 'dotenv';
import { FullClient, MovieRecord, ServiceProvider } from 'redis-sdk';
import config from '../config';
import FetchMovieData from './gathers/fetch-movie-details';
import { Movie } from './types';
import { getRedisHostName } from './util';
import { LogToAllInterfaces } from './logger';

dotenv.config({ path: __dirname + '/../.env' });

const JustWatchPersonId = Number(process.env.JW_PERSON_ID || config.JustWatchPersonId);
const RedisPort = process.env.REDIS_PORT || '6379';
const MajorProjectsOnly = process.env.MAJOR_PROJECTS_ONLY !== 'false';

const NON_MAJOR_TITLE_PATTERNS: RegExp[] = [
	/\bbehind\s+the\s+scenes?\b/i,
	/\bmaking\s+of\b/i,
	/\bdeleted\s+scenes?\b/i,
	/\bfeaturette\b/i,
	/\binterview\b/i,
	/\bspecial\b/i,
	/\bshort\b/i,
	/\bpresents\b/i,
	/\binvestigates?\b/i
];

interface UpdateFailures {
	totalFailed: number;
	failedMovies: {
		title: string;
		id: number;
	}[];
}

export default async () => {
	const failures: UpdateFailures = {
		totalFailed: 0,
		failedMovies: []
	};
	const movies: MovieRecord[] = [];

	try {
		console.log(`Starting Redis data refresh at: ${new Date().toISOString()}`);
		const wtw = new WTW();
		const creditRecords = await wtw.getPersonsFilmography({
			personId: JustWatchPersonId,
			majorProjectsOnly: MajorProjectsOnly
		});
		console.log('Retrieved Acting Credit Records');
		const filteredCredits = filterMajorProjects(creditRecords);
		console.log(`Filtered credit records. before=${creditRecords.length}, after=${filteredCredits.length}`);

		const serviceProviders = await wtw.getProviders();
		console.log('Retrieved Streaming Service Providers');

		console.log('Beginning iteration over movie credits', filteredCredits.length);
		await iterateThroughCredits(filteredCredits, movies, failures);

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

function filterMajorProjects(records: ObjectSearchResult[]) {
	if (!MajorProjectsOnly) {
		return records;
	}
	return records.filter(record => {
		const title = record.title || '';
		for (const pattern of NON_MAJOR_TITLE_PATTERNS) {
			if (pattern.test(title)) {
				return false;
			}
		}
		return true;
	});
}

function getTmdbIdFromObjectSearchResult(record: ObjectSearchResult) {
	const { scoring = [] } = record;
	const { value: tmdbId = 0 } =
		scoring.find(obj => {
			return obj.providerType === 'tmdb:id';
		}) || {};
	return tmdbId;
}

function getImdbIdFromObjectSearchResult(record: ObjectSearchResult) {
	const { externalIds = [] } = record;
	const imdbRecord = externalIds.find(externalId => externalId.provider === 'imdb');
	return imdbRecord?.externalId;
}

async function iterateThroughCredits(
	creditRecords: ObjectSearchResult[],
	movieRecords: MovieRecord[],
	failures: UpdateFailures
) {
	for (const record of creditRecords) {
		const { title, objectType, originalReleaseYear } = record;
		const tmdbId = getTmdbIdFromObjectSearchResult(record);
		const imdbId = getImdbIdFromObjectSearchResult(record);
		try {
			console.log(`Movie: ${title}: ${objectType}, tmdb: ${tmdbId}`);
			const movieObject = await getAdditionalMovieData({
				movieId: tmdbId,
				imdbId,
				title,
				releaseYear: originalReleaseYear
			});
			console.log(`Adding Movie to list to update: ${tmdbId}`);
			const movieRecord = mergeMovieData(record, movieObject);
			movieRecords.push(movieRecord);
		} catch (err) {
			addFailedRecord(
				{
					movieId: tmdbId,
					title,
					err
				},
				failures
			);
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
		await LogToAllInterfaces('Successfully connected to Redis instance');
		console.log('Updating Movie Catalog');
		await client.updateMovieCatalog(movies);
		console.log('Updating Service Providers');
		await client.updateServiceProviders(serviceProviders);
		await client.disconnect();
		await LogToAllInterfaces('Successfully updated data & disconnected from Redis instance');
	} catch (err) {
		await client.disconnect();
		await LogToAllInterfaces('Issue encountered with Redis update', true);
		throw err;
	}
}

async function getAdditionalMovieData({
	movieId,
	imdbId,
	title,
	releaseYear
}: {
	movieId: number;
	imdbId?: string;
	title?: string;
	releaseYear?: number;
}) {
	if (movieId === 0 && !imdbId && !title) {
		throw Error('Error with data being pulled, id should always be defined');
	}
	return await FetchMovieData({
		movieId,
		imdbId,
		title,
		releaseYear
	});
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

function addFailedRecord({ movieId, err, title }, failures: UpdateFailures) {
	console.log(`Failed getting data for movie: ${movieId}`);
	console.warn(err);
	failures.totalFailed++;
	failures.failedMovies.push({
		title,
		id: movieId
	});
}
