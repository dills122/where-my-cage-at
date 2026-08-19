import { randomUUID } from 'node:crypto';
import WTW, { ObjectSearchResult } from '@dills1220/wtw/index';
import * as dotenv from 'dotenv';
import {
	CataloguePublication,
	CatalogueRefreshFailure,
	CatalogueRefreshStatus,
	FullClient,
	MovieRecord,
	ServiceProvider
} from 'redis-sdk';
import config from '../config';
import FetchMovieData from './gathers/fetch-movie-details';
import { LogToAllInterfaces } from './logger';
import { Movie } from './types';
import { getRedisHostName } from './util';

dotenv.config({ path: __dirname + '/../.env' });

const JustWatchPersonId = Number(process.env.JW_PERSON_ID || config.JustWatchPersonId);
const RedisPort = process.env.REDIS_PORT || '6379';
const MajorProjectsOnly = process.env.MAJOR_PROJECTS_ONLY !== 'false';
const DefaultConcurrency = readPositiveInteger(process.env.ENRICHMENT_CONCURRENCY, 5);
const DefaultFailureRatio = readRatio(process.env.MAX_ENRICHMENT_FAILURE_RATIO, 0.1);

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

export interface UpdateFailures {
	totalFailed: number;
	failedMovies: CatalogueRefreshFailure[];
}

interface RedisPublisher {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	publishCatalog(publication: CataloguePublication): Promise<void>;
	recordRefreshFailure(status: CatalogueRefreshStatus): Promise<void>;
}

type MovieDataFetcher = (args: {
	movieId: number;
	imdbId?: string;
	title?: string;
	releaseYear?: number;
}) => Promise<Movie>;

type RefreshLogger = (message: string, isError?: boolean) => Promise<void>;

export interface RetryPolicy {
	maxAttempts: number;
	timeoutMs: number;
	baseDelayMs: number;
	maxDelayMs: number;
}

interface EnrichmentOptions {
	concurrency: number;
	retryPolicy: RetryPolicy;
	sleep: (milliseconds: number) => Promise<void>;
}

interface CatalogueSource {
	getPersonsFilmography(args: {
		personId: number;
		majorProjectsOnly: boolean;
	}): Promise<ObjectSearchResult[]>;
	getProviders(): Promise<ServiceProvider[]>;
}

export interface RefreshDependencies {
	source?: CatalogueSource;
	redisClient?: RedisPublisher;
	fetchMovieData?: MovieDataFetcher;
	log?: RefreshLogger;
	now?: () => number;
	createVersion?: (startedAt: number) => string;
	maxFailureRatio?: number;
	enrichment?: Partial<EnrichmentOptions>;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
	maxAttempts: 3,
	timeoutMs: 10_000,
	baseDelayMs: 250,
	maxDelayMs: 4_000
};

export default async () => refreshCatalogue();

export async function refreshCatalogue(
	dependencies: RefreshDependencies = {}
): Promise<CatalogueRefreshStatus> {
	const now = dependencies.now || Date.now;
	const startedAtMs = now();
	const version = (dependencies.createVersion || createVersion)(startedAtMs);
	const source = dependencies.source || new WTW();
	const client =
		dependencies.redisClient ||
		new FullClient({
			host: getRedisHostName(),
			port: RedisPort
		});
	const log = dependencies.log || LogToAllInterfaces;
	const failures: UpdateFailures = { totalFailed: 0, failedMovies: [] };
	const movies: MovieRecord[] = [];
	let creditCount = 0;
	let serviceProviders: ServiceProvider[] = [];
	const retryPolicy = {
		...DEFAULT_RETRY_POLICY,
		...dependencies.enrichment?.retryPolicy
	};
	const wait = dependencies.enrichment?.sleep || sleep;

	await safeLog(log, JSON.stringify({ event: 'catalogue_refresh_started', version }));

	try {
		const [creditRecords, providers] = await Promise.all([
			executeWithRetry(
				() =>
					source.getPersonsFilmography({
						personId: JustWatchPersonId,
						majorProjectsOnly: MajorProjectsOnly
					}),
				retryPolicy,
				wait
			),
			executeWithRetry(() => source.getProviders(), retryPolicy, wait)
		]);
		const filteredCredits = filterMajorProjects(creditRecords);
		creditCount = filteredCredits.length;
		serviceProviders = providers;

		await iterateThroughCredits(
			filteredCredits,
			movies,
			failures,
			dependencies.fetchMovieData || getAdditionalMovieData,
			{
				concurrency: dependencies.enrichment?.concurrency || DefaultConcurrency,
				retryPolicy,
				sleep: wait
			}
		);

		assertPublishable(creditCount, movies.length, failures, dependencies.maxFailureRatio);
		const status = createStatus({
			state: 'success',
			version,
			startedAtMs,
			completedAtMs: now(),
			creditCount,
			movieCount: movies.length,
			providerCount: serviceProviders.length,
			failures
		});

		await updateEntireRedisInstance(movies, serviceProviders, client, log, status);
		await safeLog(log, JSON.stringify({ event: 'catalogue_refresh_completed', ...status }));
		return status;
	} catch (err) {
		const status = createStatus({
			state: 'failed',
			version,
			startedAtMs,
			completedAtMs: now(),
			creditCount,
			movieCount: movies.length,
			providerCount: serviceProviders.length,
			failures
		});

		try {
			await recordFailedRefresh(client, status);
		} catch (statusError) {
			await safeLog(
				log,
				JSON.stringify({
					event: 'catalogue_refresh_status_write_failed',
					version,
					message: getErrorMessage(statusError)
				}),
				true
			);
		}
		await safeLog(
			log,
			JSON.stringify({
				event: 'catalogue_refresh_failed',
				...status,
				message: getErrorMessage(err)
			}),
			true
		);
		throw err;
	}
}

function filterMajorProjects(records: ObjectSearchResult[]) {
	if (!MajorProjectsOnly) {
		return records;
	}
	return records.filter(record => {
		const title = record.title || '';
		return !NON_MAJOR_TITLE_PATTERNS.some(pattern => pattern.test(title));
	});
}

function getTmdbIdFromObjectSearchResult(record: ObjectSearchResult) {
	const { scoring = [] } = record;
	const { value: tmdbId = 0 } = scoring.find(obj => obj.providerType === 'tmdb:id') || {};
	return tmdbId;
}

function getImdbIdFromObjectSearchResult(record: ObjectSearchResult) {
	const { externalIds = [] } = record;
	return externalIds.find(externalId => externalId.provider === 'imdb')?.externalId;
}

export async function iterateThroughCredits(
	creditRecords: ObjectSearchResult[],
	movieRecords: MovieRecord[],
	failures: UpdateFailures,
	fetchMovieData: MovieDataFetcher = getAdditionalMovieData,
	options: Partial<EnrichmentOptions> = {}
) {
	const concurrency = Math.max(1, Math.floor(options.concurrency || DefaultConcurrency));
	const retryPolicy = { ...DEFAULT_RETRY_POLICY, ...options.retryPolicy };
	const wait = options.sleep || sleep;
	const successfulRecords: Array<MovieRecord | undefined> = new Array(creditRecords.length);
	const failedRecords: Array<CatalogueRefreshFailure | undefined> = new Array(creditRecords.length);
	let nextIndex = 0;

	const worker = async () => {
		while (nextIndex < creditRecords.length) {
			const index = nextIndex++;
			const record = creditRecords[index];
			const { title, originalReleaseYear } = record;
			const tmdbId = getTmdbIdFromObjectSearchResult(record);
			const imdbId = getImdbIdFromObjectSearchResult(record);

			try {
				const movieObject = await executeWithRetry(
					() =>
						fetchMovieData({
							movieId: tmdbId,
							imdbId,
							title,
							releaseYear: originalReleaseYear
						}),
					retryPolicy,
					wait
				);
				successfulRecords[index] = mergeMovieData(record, movieObject);
			} catch (err) {
				failedRecords[index] = {
					id: tmdbId,
					title: title || 'Untitled',
					message: getErrorMessage(err)
				};
			}
		}
	};

	await Promise.all(Array.from({ length: Math.min(concurrency, creditRecords.length) }, () => worker()));
	movieRecords.push(...successfulRecords.filter((record): record is MovieRecord => Boolean(record)));
	const newFailures = failedRecords.filter((record): record is CatalogueRefreshFailure => Boolean(record));
	failures.failedMovies.push(...newFailures);
	failures.totalFailed += newFailures.length;
}

export async function executeWithRetry<T>(
	task: () => Promise<T>,
	policy: RetryPolicy = DEFAULT_RETRY_POLICY,
	wait: (milliseconds: number) => Promise<void> = sleep
): Promise<T> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
		try {
			return await withTimeout(task(), policy.timeoutMs);
		} catch (err) {
			lastError = err;
			if (attempt === policy.maxAttempts || !isRetryable(err)) {
				throw err;
			}
			const retryAfterMs = getRetryAfterMs(err);
			const backoffMs = Math.min(policy.baseDelayMs * 2 ** (attempt - 1), policy.maxDelayMs);
			await wait(retryAfterMs ?? backoffMs);
		}
	}
	throw lastError;
}

export async function updateEntireRedisInstance(
	movies: MovieRecord[],
	serviceProviders: ServiceProvider[],
	redisClient?: RedisPublisher,
	log: RefreshLogger = LogToAllInterfaces,
	status: CatalogueRefreshStatus = createAdHocSuccessStatus(movies, serviceProviders)
) {
	const client =
		redisClient ||
		new FullClient({
			host: getRedisHostName(),
			port: RedisPort
		});
	try {
		await client.connect();
		await client.publishCatalog({
			version: status.version,
			movies,
			serviceProviders,
			status
		});
		await safeLog(log, JSON.stringify({ event: 'catalogue_publish_succeeded', version: status.version }));
	} catch (err) {
		await safeLog(
			log,
			JSON.stringify({
				event: 'catalogue_publish_failed',
				version: status.version,
				message: getErrorMessage(err)
			}),
			true
		);
		throw err;
	} finally {
		await client.disconnect();
	}
}

async function recordFailedRefresh(client: RedisPublisher, status: CatalogueRefreshStatus) {
	try {
		await client.connect();
		await client.recordRefreshFailure(status);
	} finally {
		await client.disconnect();
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
	return FetchMovieData({ movieId, imdbId, title, releaseYear });
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
		cinemaReleaseDate,
		runtime,
		imdbId,
		originalLanguage,
		genres
	} as MovieRecord;
}

function assertPublishable(
	creditCount: number,
	movieCount: number,
	failures: UpdateFailures,
	configuredRatio = DefaultFailureRatio
) {
	if (creditCount === 0 || movieCount === 0) {
		throw new Error('Refresh rejected because no enriched movies were produced');
	}
	const allowedRatio = readRatio(String(configuredRatio), DefaultFailureRatio);
	const failureRatio = failures.totalFailed / creditCount;
	if (failureRatio > allowedRatio) {
		throw new Error(
			`Refresh rejected because enrichment failure ratio ${failureRatio.toFixed(3)} exceeded ${allowedRatio}`
		);
	}
}

function createStatus({
	state,
	version,
	startedAtMs,
	completedAtMs,
	creditCount,
	movieCount,
	providerCount,
	failures
}: {
	state: CatalogueRefreshStatus['state'];
	version: string;
	startedAtMs: number;
	completedAtMs: number;
	creditCount: number;
	movieCount: number;
	providerCount: number;
	failures: UpdateFailures;
}): CatalogueRefreshStatus {
	return {
		state,
		version,
		startedAt: new Date(startedAtMs).toISOString(),
		completedAt: new Date(completedAtMs).toISOString(),
		durationMs: Math.max(0, completedAtMs - startedAtMs),
		counts: {
			credits: creditCount,
			movies: movieCount,
			serviceProviders: providerCount,
			failed: failures.totalFailed
		},
		failures: failures.failedMovies
	};
}

function createAdHocSuccessStatus(
	movies: MovieRecord[],
	serviceProviders: ServiceProvider[]
): CatalogueRefreshStatus {
	const timestamp = Date.now();
	return createStatus({
		state: 'success',
		version: createVersion(timestamp),
		startedAtMs: timestamp,
		completedAtMs: timestamp,
		creditCount: movies.length,
		movieCount: movies.length,
		providerCount: serviceProviders.length,
		failures: { totalFailed: 0, failedMovies: [] }
	});
}

function createVersion(startedAt: number) {
	return `${new Date(startedAt).toISOString()}-${randomUUID()}`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	let timeout: NodeJS.Timeout | undefined;
	const timeoutPromise = new Promise<never>((_resolve, reject) => {
		timeout = setTimeout(() => reject(new RequestTimeoutError(timeoutMs)), timeoutMs);
	});
	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		if (timeout) {
			clearTimeout(timeout);
		}
	}
}

class RequestTimeoutError extends Error {
	constructor(timeoutMs: number) {
		super(`External request timed out after ${timeoutMs}ms`);
		this.name = 'RequestTimeoutError';
	}
}

function isRetryable(error: unknown) {
	if (error instanceof RequestTimeoutError) {
		return true;
	}
	const candidate = error as {
		code?: string;
		statusCode?: number;
		response?: { statusCode?: number };
	};
	const statusCode = candidate?.statusCode || candidate?.response?.statusCode;
	if (statusCode != null) {
		return statusCode === 429 || statusCode >= 500;
	}
	return ['ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'ETIMEDOUT'].includes(candidate?.code || '');
}

function getRetryAfterMs(error: unknown) {
	const headers = (error as { response?: { headers?: Record<string, string | string[] | undefined> } })
		?.response?.headers;
	const value = headers?.['retry-after'];
	const raw = Array.isArray(value) ? value[0] : value;
	if (!raw) {
		return undefined;
	}
	const seconds = Number(raw);
	if (Number.isFinite(seconds)) {
		return Math.max(0, seconds * 1_000);
	}
	const date = Date.parse(raw);
	return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

function sleep(milliseconds: number) {
	return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

async function safeLog(log: RefreshLogger, message: string, isError = false) {
	try {
		await log(message, isError);
	} catch (err) {
		console.error('Unable to write refresh log', err);
	}
}

function readPositiveInteger(value: string | undefined, fallback: number) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readRatio(value: string | undefined, fallback: number) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}
