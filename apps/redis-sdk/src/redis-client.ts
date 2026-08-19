import { createClient } from 'redis';

export interface RedisClientLike {
	connect(): Promise<unknown>;
	disconnect(): Promise<unknown>;
	json: {
		get(key: string, path?: string): Promise<unknown>;
		set(key: string, path: string, value: unknown): Promise<unknown>;
		del(key: string, path?: string): Promise<unknown>;
	};
}

export const createRedisClient = ({ host, port }: { host: string; port: string }): RedisClientLike =>
	createClient({
		socket: {
			port: Number(port),
			host
		}
	}) as unknown as RedisClientLike;
