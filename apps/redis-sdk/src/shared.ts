const movieCatalogPath = 'moviecatalog:jsondata';
const serviceProvidersPath = 'serviceproviders:jsondata';

export default {
	serviceProvidersPath,
	movieCatalogPath,
	activeCatalogVersionPath: 'catalogue:active-version',
	refreshStatusPath: 'catalogue:refresh-status',
	refreshLockPath: 'catalogue:refresh-lock',
	movieCatalogVersionPath: (version: string) => `${movieCatalogPath}:version:${version}`,
	serviceProvidersVersionPath: (version: string) => `${serviceProvidersPath}:version:${version}`
};
