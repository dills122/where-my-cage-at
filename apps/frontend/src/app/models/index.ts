export interface ServiceProvider {
	id: number;
	technicalName: string;
	shortName: string;
	clearName: string;
	monetizationTypes: string[];
}

export interface MovieRecord {
	id: number;
	imdbId: string;
	title: string;
	poster: string;
	originalReleaseYear: number;
	tmdbPopularity: number;
	runtime: number;
	originalLanguage: string;
	ageCertification: string;
	cinemaReleaseDate: string;
	shortDescription: string;
	objectType: 'movie';
	localizedReleaseDate: string;
	offers: Offer[];
	genres: Array<string>;
	fullPath?: string;
	fullPaths?: {
		[str: string]: string;
	};
	productionCountries?: string[];
	scoring?: {
		providerType: string;
		value: number;
	}[];
	externalIds?: Array<{
		provider: string;
		externalId: string;
	}>;
}

export interface Offer {
	providerId: number;
	monetizationType: string;
	packageShortName: string;
	retailPrice: number;
	currency: string;
	urls: WatchUrlsMap;
	presentationType: string;
	country: string;
}

export interface WatchUrlsMap {
	[str: string]: string; //standard_web looks to be most used
}
