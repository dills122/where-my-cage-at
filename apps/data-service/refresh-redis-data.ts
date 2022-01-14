import FetchMovieCredits from './fetch-bulk-credits-data';
import FetchMovieData from './fetch-movie-details';

interface UpdateFailures {
  totalFailed: number;
  failedMovies: {
    title: string;
    id: number;
  }[];
}

const failures: UpdateFailures = {
  totalFailed: 0,
  failedMovies: []
};

export default async () => {
  try {
    const credits = await FetchMovieCredits();
    for (const credit of credits) {
      const { id, title } = credit;
      await getAndUpdateMovieDataFromCreditInfo(id, title);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

async function getAndUpdateMovieDataFromCreditInfo(movieId: number, title: string) {
  try {
    const movie = await FetchMovieData(movieId);
    //TODO need to implement redis client updates here
  } catch (err) {
    console.warn(err);
    failures.totalFailed++;
    failures.failedMovies.push({
      title,
      id: movieId
    });
  }
}
