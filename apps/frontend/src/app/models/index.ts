export interface ServiceProvider {
  id: number;
  technicalName: string;
  shortName: string;
  clearName: string;
  monetizationTypes: string[];
}

export interface MovieRecord extends Record {
  objectType: 'movie';
}

export interface Record {
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
  scoring: {
    providerType: string;
    value: number;
  }[];
}

export interface Offers {
  providerId: number;
  monetizationType: string;
  packageShortName: string;
  retailPrice: number;
  currency: string;
  urls: {
    [str: string]: string; //standard_web looks to be most used
  };
  presentationType: string;
  country: string;
}
