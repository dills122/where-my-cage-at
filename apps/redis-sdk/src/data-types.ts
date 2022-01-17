export interface ServiceProvider {
  id: number;
  technicalName: string;
  shortName: string;
  clearName: string;
  monetizationTypes: string[];
  //   data: {
  //     deeplinkData: [];
  //     packages: {
  //       androidTv: string;
  //       fireTv: string;
  //       tvos: string;
  //       tizenos: string;
  //       webos: string;
  //       xbox: string;
  //     };
  //   };
  //   addonPackages: string[] | null;
  //   parentPackages: string[] | null;
}

export interface MovieRecord extends Record {
  objectType: 'movie';
}

//TODO might be able to reuse this for a person object
export interface Record {
  id: number;
  title: string;
  fullPath: string;
  fullPaths: {
    [str: string]: string;
  };
  poster: string;
  // backdrops TODO implement later
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
  // lastChangeRetailPrice?: number;
  // lastChangeDifference?: number;
  // lastChangePercentage?: number;
  // lastChangeDate?: string;
  currency: string;
  urls: {
    [str: string]: string; //standard_web looks to be most used
  };
  presentationType: string;
  country: string;
}
