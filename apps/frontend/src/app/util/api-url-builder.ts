export const buildBaseApuUrlBasedOffEnv = (isDevMode: boolean) => {
	return isDevMode ? 'http://localhost:3000' : 'https://api.wheremycageat.com';
};
