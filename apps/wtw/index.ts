import got, { OptionsOfJSONResponseBody } from 'got';
import camelCaseObject from 'camelcase-keys';
import { catchError, from, map, Observable, throwError } from 'rxjs';

const API_DOMAIN = 'https://apis.justwatch.com/content';

export interface RequestArgs {
  url: string;
  method: 'GET' | 'POST';
}

export default class WTW {
  private _locale = 'en_US';
  public set locale(locale: string) {
    this._locale = locale;
  }

  private request<T>({ url, method }: RequestArgs): Observable<T> {
    return from(
      got<object>(url, {
        prefixUrl: API_DOMAIN,
        headers: {
          ['User-Agent']: 'JustWatch client (https://github.com/dills122/where-my-cage-at/apps/wtw)'
        },
        method
      } as OptionsOfJSONResponseBody)
    ).pipe(
      map(({ body }) => {
        return camelCaseObject(body, { deep: true }) as T;
      }),
      catchError((err) => throwError(() => new Error(err)))
    );
  }

  getProviders() {
    return this.request<ServiceProvider[]>({
      url: `providers/locale/${this._locale}`,
      method: 'GET'
    });
  }
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
