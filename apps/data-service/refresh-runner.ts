import refresh from './src/refresh-redis-data';

(async () => {
	console.log('Manual refresh initiated');
	await refresh();
})();
