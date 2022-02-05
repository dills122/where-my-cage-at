import got, { OptionsOfJSONResponseBody } from 'got';
import camelCaseObject from 'camelcase-keys';
import {
	catchError,
	EMPTY,
	expand,
	firstValueFrom,
	from,
	map,
	Observable,
	reduce,
	Subject,
	takeUntil,
	throwError
} from 'rxjs';
import _ from 'lodash';

const API_DOMAIN = 'https://apis.justwatch.com/content';

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
			catchError((err) => throwError(() => new Error(err)))
		);
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

	getPersonsFilmography(args: { personId: number; query?: string; pageSize?: number; pages?: number }) {
		const { personId, query, pageSize, pages } = args;
		const endNotifier = new Subject<boolean>();
		return firstValueFrom(
			this.request<SearchResults>({
				url: `titles/${this._locale}/popular`,
				method: 'GET',
				querySearchTerms: {
					body: JSON.stringify({
						person_id: personId,
						enable_provider_filter: false,
						is_upcoming: false,
						package_intersection: false,
						monitization_types: [],
						matching_offers_only: false,
						page: 1,
						page_size: pageSize || this.defaults.pageSize,
						query,
						...this.setupDefaultQuerySearchTerms()
					})
				}
			}).pipe(
				takeUntil(endNotifier),
				expand((data) => {
					const { totalPages, page, pageSize } = data;
					const hasHitMaxUserReqPageCount = page >= (pages || totalPages);
					const hasHitMaxServerPageCount = page >= totalPages;

					if (hasHitMaxServerPageCount || hasHitMaxUserReqPageCount) {
						endNotifier.next(true);
						endNotifier.complete();
						return EMPTY;
					}
					const nextPage = page + 1;
					return this.request<SearchResults>({
						url: `titles/${this._locale}/popular`,
						method: 'GET',
						querySearchTerms: {
							body: JSON.stringify({
								person_id: personId,
								enable_provider_filter: false,
								is_upcoming: false,
								package_intersection: false,
								monitization_types: [],
								matching_offers_only: false,
								page: nextPage,
								page_size: pageSize,
								query,
								...this.setupDefaultQuerySearchTerms()
							})
						}
					});
				}),
				map((data) => [...data.items]),
				reduce((acc, data) => {
					return acc.concat(...data);
				}),
				map((movies) => movies.filter((movie) => movie.objectType === 'movie'))
			)
		);
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
