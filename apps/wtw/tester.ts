import WTW from './index';

(async () => {
	const wtw = new WTW();
	const results = await wtw.getPersonsFilmography({
		personId: 6379,
		pageSize: 10,
		pages: 1
	});
	console.log(results);
})();
