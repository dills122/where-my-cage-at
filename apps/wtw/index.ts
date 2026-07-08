import got, { OptionsOfJSONResponseBody } from 'got';
import camelCaseObject from 'camelcase-keys';
import {
	catchError,
	firstValueFrom,
	from,
	map,
	Observable,
	throwError
} from 'rxjs';
import _ from 'lodash';

const API_DOMAIN = 'https://apis.justwatch.com/content';
const GRAPHQL_ENDPOINT = 'https://apis.justwatch.com/graphql';
const GRAPHQL_PERSON_PREFIX = 'tp';
const DEFAULT_GRAPHQL_PAGE_SIZE = 50;

const SEARCH_TITLES_QUERY = `
	query CageMovies(
		$country: Country!,
		$language: Language!,
		$first: Int!,
		$after: String,
		$filter: TitleFilter!,
		$location: String!
	) {
		searchTitles(
			country: $country
			first: $first
			after: $after
			filter: $filter
			sortBy: POPULAR
			source: $location
		) {
			pageInfo {
				hasNextPage
				endCursor
			}
			edges {
				node {
					id
					objectType
					content(country: $country, language: $language) {
						title
						originalReleaseYear
						fullPath
						shortDescription
						ageCertification
						externalIds {
							imdbId
							tmdbId
						}
					}
					offers(country: $country, platform: WEB) {
						monetizationType
						presentationType
						standardWebURL
						deeplinkURL(platform: WEB)
						retailPriceValue
						currency
						package {
							id
							shortName
							clearName
							technicalName
							icon
							iconWide
							monetizationTypes
						}
					}
				}
			}
		}
	}
`;

export interface RequestArgs {
	url: string;
	method: 'GET' | 'POST';
	querySearchTerms?: Record<string, string | number | boolean | null | undefined>;
}

export default class WTW {
	private _locale = 'en_US';
	private _defaults = {
		pageSize: 100
	};
	public set locale(locale: string) {
		this._locale = locale;
	}

	public get defaults() {
		return this._defaults;
	}

	private setupDefaultQuerySearchTerms() {
		return {
			fields: [
				'full_path',
				'full_paths',
				'id',
				'localized_release_date',
				'object_type',
				'poster',
				'scoring',
				'title',
				'tmdb_popularity',
				'backdrops',
				'production_countries',
				'offers',
				'original_release_year',
				'backdrops',
				'short_description',
				'age_certification',
				'cinema_release_date',
				'external_ids'
			]
		};
	}

	private setupSearchParams(querySearchTerms: QuerySearchTerms) {
		querySearchTerms = {
			...this.setupDefaultQuerySearchTerms(),
			...querySearchTerms
		};
		for (const key in querySearchTerms) {
			if (Object.prototype.hasOwnProperty.call(querySearchTerms, key) && _.isArray(querySearchTerms[key])) {
				querySearchTerms[key] = JSON.stringify(querySearchTerms[key]);
			}
		}
		return querySearchTerms as Record<string, string>;
	}

	private request<T>({ url, method, querySearchTerms }: RequestArgs): Observable<T> {
		return from(
			got<string>(url, {
				prefixUrl: API_DOMAIN,
				headers: {
					['User-Agent']: 'JustWatch client (https://github.com/dills122/where-my-cage-at/apps/wtw)'
				},
				method,
				searchParams: !querySearchTerms ? undefined : this.setupSearchParams(querySearchTerms)
			} as OptionsOfJSONResponseBody)
		).pipe(
			map(({ body }) => {
				return camelCaseObject(JSON.parse(body), { deep: true }) as T;
			}),
			catchError(err => throwError(() => new Error(err)))
		);
	}

	private async graphqlRequest<T>({
		query,
		variables
	}: {
		query: string;
		variables: Record<string, unknown>;
	}): Promise<T> {
		const response = await got.post(GRAPHQL_ENDPOINT, {
			headers: {
				['Content-Type']: 'application/json',
				['User-Agent']: 'JustWatch client (https://github.com/dills122/where-my-cage-at/apps/wtw)'
			},
			json: {
				query,
				variables
			},
			responseType: 'json'
		});
		const payload = response.body as {
			data?: T;
			errors?: Array<{ message: string }>;
		};

		if (payload.errors && payload.errors.length > 0) {
			throw new Error(payload.errors.map(err => err.message).join('; '));
		}
		if (!payload.data) {
			throw new Error('JustWatch GraphQL returned no data');
		}
		return payload.data;
	}

	private mapLocaleToCountryAndLanguage() {
		const [language = 'en', country = 'US'] = this._locale.split('_');
		return {
			country: country.toUpperCase(),
			language: language.toLowerCase()
		};
	}

	private toPersonGraphqlId(personId: number | string) {
		if (typeof personId === 'string' && personId.startsWith(GRAPHQL_PERSON_PREFIX)) {
			return personId;
		}
		return `${GRAPHQL_PERSON_PREFIX}${personId}`;
	}

	private decodeProviderId(encodedProviderId: string) {
		try {
			const decoded = Buffer.from(encodedProviderId, 'base64').toString('utf8');
			const value = Number(decoded.split('|').pop());
			return Number.isFinite(value) ? value : 0;
		} catch (err) {
			return 0;
		}
	}

	private parseTmdbIdFromGraphqlNodeId(nodeId: string) {
		if (!nodeId.startsWith('tm')) {
			return 0;
		}
		const parsed = Number(nodeId.slice(2));
		return Number.isFinite(parsed) ? parsed : 0;
	}

	private parseTmdbId(value?: string | null) {
		if (!value) {
			return 0;
		}
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	private buildTitleFilter({ personId, majorProjectsOnly }: { personId: number | string; majorProjectsOnly: boolean }) {
		const filter: GraphqlTitleFilter = {
			personId: this.toPersonGraphqlId(personId),
			includeTitlesWithoutUrl: true,
			isUpcoming: false
		};
		if (!majorProjectsOnly) {
			return filter;
		}
		return {
			...filter,
			objectTypes: ['MOVIE'],
			releaseYear: {
				min: 1970,
				max: 2035
			},
			runtime: {
				min: 70
			},
			excludeGenres: ['doc'],
			monetizationTypes: ['FLATRATE', 'RENT', 'BUY'],
			presentationTypes: ['HD']
		};
	}

	search(querySearchTerms: QuerySearchTerms) {
		return firstValueFrom(
			this.request<ServiceProvider[]>({
				url: `titles/${this._locale}/popular`,
				method: 'GET',
				querySearchTerms: this.setupSearchParams(querySearchTerms)
			})
		);
	}

	async getPersonsFilmography(args: {
		personId: number;
		query?: string;
		pageSize?: number;
		pages?: number;
		majorProjectsOnly?: boolean;
	}) {
		const { personId, query, pageSize, pages, majorProjectsOnly = true } = args;
		const { country, language } = this.mapLocaleToCountryAndLanguage();
		const allMovies: ObjectSearchResult[] = [];
		const maxPages = pages ?? Number.MAX_SAFE_INTEGER;
		let cursor: string | null = null;
		let pageCounter = 0;
		const filter = this.buildTitleFilter({ personId, majorProjectsOnly });

		while (pageCounter < maxPages) {
			pageCounter++;
			const response = await this.graphqlRequest<GraphqlSearchTitlesResponse>({
				query: SEARCH_TITLES_QUERY,
				variables: {
					country,
					language,
					first: pageSize || DEFAULT_GRAPHQL_PAGE_SIZE,
					after: cursor,
					filter,
					location: 'SearchPage'
				}
			});

			const edges = response.searchTitles?.edges ?? [];
			const mappedMovies = edges
				.map(edge => edge.node)
				.filter(node => node.objectType === 'MOVIE')
				.map(node => {
					const tmdbId =
						this.parseTmdbId(node.content?.externalIds?.tmdbId) || this.parseTmdbIdFromGraphqlNodeId(node.id);
					const imdbId = node.content?.externalIds?.imdbId || '';
					const content = node.content;
					return {
						id: tmdbId,
						title: content?.title || '',
						fullPath: content?.fullPath || '',
						fullPaths: {},
						poster: '',
						originalReleaseYear: content?.originalReleaseYear || 0,
						tmdbPopularity: 0,
						objectType: 'movie' as const,
						localizedReleaseDate: '',
						offers: (node.offers || []).map(offer => ({
							providerId: this.decodeProviderId(offer.package.id),
							monetizationType: offer.monetizationType.toLowerCase(),
							packageShortName: offer.package.shortName || '',
							retailPrice: offer.retailPriceValue || 0,
							currency: offer.currency || '',
							urls: {
								standardWeb: offer.standardWebURL,
								standard_web: offer.standardWebURL,
								deeplink: offer.deeplinkURL
							},
							presentationType: offer.presentationType.toLowerCase(),
							country
						})),
						productionCountries: [],
						scoring: [
							{
								providerType: 'tmdb:id',
								value: tmdbId
							}
						],
						ageCertification: content?.ageCertification || '',
						cinemaReleaseDate: '',
						shortDescription: content?.shortDescription || '',
						externalIds: imdbId
							? [
									{
										provider: 'imdb',
										externalId: imdbId
									}
								]
							: []
					};
				});

			allMovies.push(...mappedMovies);

			const { hasNextPage, endCursor } = response.searchTitles?.pageInfo || {};
			if (!hasNextPage || !endCursor) {
				break;
			}
			cursor = endCursor;
		}

		if (query && query.trim() !== '') {
			const q = query.toLocaleLowerCase();
			return allMovies.filter(movie => movie.title.toLocaleLowerCase().includes(q));
		}

		return allMovies;
	}

	getProviders() {
		return firstValueFrom(
			this.request<ServiceProvider[]>({
				url: `providers/locale/${this._locale}`,
				method: 'GET'
			})
		);
	}
}

export interface QuerySearchTerms {
	content_types?: string;
	presentation_types?: string;
	providers?: string;
	genres?: string[];
	languages?: string[];
	release_year_from?: string;
	release_year_until?: string;
	monetization_types?: string[];
	matching_offers_only?: boolean;
	person_id?: number;
	min_price?: string;
	max_price?: string;
	scoring_filter_types?: string;
	cinema_release?: string;
	query?: string;
	page?: number;
	page_size?: number;
	fields?: string[];
}
export interface ServiceProvider {
	id: number;
	technicalName: string;
	shortName: string;
	clearName: string;
	monetizationTypes: string[];
	data: {
		deeplinkData: [];
		packages: {
			androidTv: string;
			fireTv: string;
			tvos: string;
			tizenos: string;
			webos: string;
			xbox: string;
		};
	};
	addonPackages: string[] | null;
	parentPackages: string[] | null;
	iconUrl: string | null;
}

export interface PaginatedResults {
	page: number;
	pageSize: number;
	totalPages: number;
	totalResults: number;
	items: ObjectSearchResult[];
}

export interface SearchResults extends PaginatedResults {
	items: ObjectSearchResult[];
}

interface GraphqlSearchTitlesResponse {
	searchTitles: {
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string | null;
		};
		edges: Array<{
			node: {
				id: string;
				objectType: 'MOVIE' | 'SHOW' | 'SEASON' | 'EPISODE' | 'PERSON';
					content: {
						title: string;
						originalReleaseYear: number;
						fullPath: string;
						shortDescription: string;
						ageCertification: string;
						externalIds: {
							imdbId: string | null;
							tmdbId: string | null;
						};
					} | null;
					offers: Array<{
						monetizationType: string;
						presentationType: string;
						standardWebURL: string;
						deeplinkURL: string;
						retailPriceValue: number | null;
						currency: string;
						package: {
							id: string;
							shortName: string;
							clearName: string;
							technicalName: string;
							icon: string;
							iconWide: string;
							monetizationTypes: string[];
						};
					}>;
			};
		}>;
	};
}

interface GraphqlIntFilter {
	min?: number;
	max?: number;
}

interface GraphqlTitleFilter {
	personId: string;
	includeTitlesWithoutUrl: boolean;
	objectTypes?: string[];
	releaseYear?: GraphqlIntFilter;
	runtime?: GraphqlIntFilter;
	excludeGenres?: string[];
	monetizationTypes?: string[];
	presentationTypes?: string[];
	isUpcoming?: boolean;
	packages?: string[];
}

export interface ObjectSearchResult {
	id: number;
	title: string;
	fullPath: string;
	fullPaths: {
		[str: string]: string;
	};
	poster: string;
	originalReleaseYear: number;
	tmdbPopularity: number;
	objectType: 'movie' | 'person';
	localizedReleaseDate: string;
	offers: Offers[];
	productionCountries: string[];
	scoring: Array<{
		providerType: string;
		value: number;
	}>;
	ageCertification: string;
	cinemaReleaseDate: string;
	shortDescription: string;
	externalIds: Array<{
		provider: string;
		externalId: string;
	}>;
}

export interface Offers {
	providerId: number;
	monetizationType: string;
	packageShortName: string;
	retailPrice: number;
	lastChangeRetailPrice?: number;
	lastChangeDifference?: number;
	lastChangePercentage?: number;
	lastChangeDate?: string;
	currency: string;
	urls: {
		[str: string]: string; //standard_web looks to be most used
	};
	presentationType: string;
	country: string;
}
