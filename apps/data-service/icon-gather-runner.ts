import gather from './src/gather-service-provider-icons';

// Cant run inside container, icons are mapped for lcoal only
(async () => {
	console.log('Manual icon gather initiated');
	await gather();
})();
