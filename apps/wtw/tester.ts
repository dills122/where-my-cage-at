import WTW from './index';

(async () => {
	const personId = Number(process.env.JW_PERSON_ID || 6747);
	if (!Number.isInteger(personId) || personId <= 0) {
		throw new Error('JW_PERSON_ID must be a positive integer');
	}

	const wtw = new WTW();
	const movies = await wtw.getPersonsFilmography({ personId });
	const providers = await wtw.getProviders();
	const providerIds = new Set(providers.map(provider => provider.id));
	const offerProviderIds = Array.from(
		new Set(movies.flatMap(movie => movie.offers.map(offer => offer.providerId)))
	);
	const moviesWithoutTmdbIds = movies.filter(movie => movie.id === 0);
	const unmatchedProviderIds = offerProviderIds.filter(providerId => !providerIds.has(providerId));

	if (movies.length === 0) {
		throw new Error(`JustWatch returned no movies for person ${personId}`);
	}
	if (moviesWithoutTmdbIds.length > 0) {
		throw new Error(
			`JustWatch returned movies without TMDB ids: ${moviesWithoutTmdbIds.map(movie => movie.title).join(', ')}`
		);
	}
	if (unmatchedProviderIds.length > 0) {
		throw new Error(
			`Offer provider ids are missing from the provider feed: ${unmatchedProviderIds.join(', ')}`
		);
	}

	console.log(
		JSON.stringify(
			{
				personId,
				movies: movies.length,
				providers: providers.length,
				uniqueOfferProviders: offerProviderIds.length
			},
			null,
			2
		)
	);
})().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
