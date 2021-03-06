import { ReadOnlyClient } from 'redis-sdk';
import { getRedisHostName } from '../util';

(async () => {
	const redisHostName = getRedisHostName();
	const redisPort = process.env.REDIS_PORT || '6379';
	const client = new ReadOnlyClient({
		host: redisHostName,
		port: redisPort
	});
	try {
		await client.connect();
		console.log('Retrieving Movie Catalog');
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
