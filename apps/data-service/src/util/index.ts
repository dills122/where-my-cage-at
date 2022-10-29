export const isProd = () => {
	return process.env.NODE_ENV === 'prod';
};
export const getRedisHostName = () => {
	return 'redis';
};
