export const isProd = () => {
	return process.env.NODE_ENV === 'prod';
};
export const getRedisHostName = () => {
	const envHost = process.env.REDIS_HOST;
	if (envHost) {
		return envHost;
	}
	return isProd() ? 'redis' : 'localhost';
};
