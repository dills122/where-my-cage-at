const baseUrl = 'https://www.themoviedb.org/movie';

export const buildMoviePageUrl = (movieId: number) => {
	return `${baseUrl}/${movieId}?language=en-US`; //TODO update this if I make multi-ling
};
