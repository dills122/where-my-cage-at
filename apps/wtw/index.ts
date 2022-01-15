import got, { OptionsOfJSONResponseBody } from 'got';
import camelCaseObject from 'camelcase-keys';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import _ from 'lodash';

const API_DOMAIN = 'https://apis.justwatch.com/content';

export interface RequestArgs {
  url: string;
  method: 'GET' | 'POST';
  querySearchTerms?: Record<string, string | number | boolean | null | undefined>;
}

export default class WTW {
  private _locale = 'en_US';
  public set locale(locale: string) {
    this._locale = locale;
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
        'backdrops'
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
      got<object>(url, {
        prefixUrl: API_DOMAIN,
        headers: {
          ['User-Agent']: 'JustWatch client (https://github.com/dills122/where-my-cage-at/apps/wtw)'
        },
        method,
        searchParams: !querySearchTerms ? undefined : this.setupSearchParams(querySearchTerms)
      } as OptionsOfJSONResponseBody)
    ).pipe(
      map(({ body }) => {
        return camelCaseObject(body, { deep: true }) as T;
      }),
      catchError((err) => throwError(() => new Error(err)))
    );
  }

  search(querySearchTerms: QuerySearchTerms) {
    return this.request<ServiceProvider[]>({
      url: `titles/${this._locale}/popular`,
      method: 'GET',
      querySearchTerms: this.setupSearchParams(querySearchTerms)
    });
  }

  getPersonsFilmography(personId: number, query?: string) {
    return this.request<unknown>({
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
          page_size: 500,
          query,
          ...this.setupDefaultQuerySearchTerms()
        })
      }
    });
  }

  getProviders() {
    return this.request<ServiceProvider[]>({
      url: `providers/locale/${this._locale}`,
      method: 'GET'
    });
  }
}

//TODO probably needs updated to fix with better more accurate types
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
}
