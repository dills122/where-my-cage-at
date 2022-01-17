import WTW from '@dills1220/wtw';

// dotenv.config({ path: __dirname + '/.env' });

// const JustWatchPersonId = Number(process.env.JW_PERSON_ID);

(async () => {
  const wtw = new WTW();
  const creditRecords = await wtw.getPersonsFilmography({
    personId: 6747
  });
  creditRecords
    .filter((record) => record.objectType === 'movie')
    .forEach((record) => {
      const { title, id, scoring } = record;
      const { value: tmdbId = 0 } =
        scoring.find((obj) => {
          return obj.providerType === 'tmdb:id';
        }) || {};

      if (tmdbId === 0) {
        console.warn(`Can not find tmdbId for Movie: ${id}; ${title}`);
      }
    });
})();
