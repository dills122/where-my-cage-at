export interface MovieCreditsListsByRole {
	cast: CastCredit[];
	crew: CrewCredit[];
}

export interface CrewCredit {
	department: string;
	creditId: string;
	releaseDate: string;
	id: number;
	title: string;
	overview: string;
	posterPath: string;
	popularity: number;
	voteAverage: number;
}

export interface CastCredit {
	character: string;
	creditId: string;
	releaseDate: string;
	id: number;
	name: string;
	title: string;
	overview: string;
	posterPath: string;
	popularity: number;
	voteAverage: number;
}

export interface Movie {
	adult: boolean;
	budget: number;
	homepage: string;
	id: number;
	imdbId: string;
	popularity: number;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string;
	runtime: number | null;
	title: string;
	originalTitle: string;
	originalLanguage: string;
	revenue: number;
	overview: string | null;
	genres: Array<string>; //map this to a list of strings instead
	shortDescription: string;
	ageCertification: string | null;
	cinemaReleaseDate: string;
}
