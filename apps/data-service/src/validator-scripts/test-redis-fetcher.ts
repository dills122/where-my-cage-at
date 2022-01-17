import { ReadOnlyClient } from 'redis-sdk';

(async () => {
  const client = new ReadOnlyClient({
    host: 'localhost',
    port: '6379'
  });
  try {
    await client.connect();
    console.log('Updating Movie Catalog');
    const movies = await client.getMovieCatalog();
    if (movies != null) {
      console.log(JSON.stringify(movies, null, 4));
    } else {
      console.error('no movies found, probably not good if running this');
    }
    await client.disconnect();
  } catch (err) {
    await client.disconnect();
    throw err;
  }
})();
