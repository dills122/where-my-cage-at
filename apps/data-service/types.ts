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
