import { createClient } from 'redis';

export interface RedisMultiLike {
	set(key: string, value: string): RedisMultiLike;
	json: {
		set(key: string, path: string, value: unknown): RedisMultiLike;
	};
	exec(): Promise<unknown>;
}

export interface RedisClientLike {
	connect(): Promise<unknown>;
	disconnect(): Promise<unknown>;
	get(key: string): Promise<string | null>;
	set(key: string, value: string, options?: { NX?: boolean; PX?: number }): Promise<string | null>;
	eval(script: string, options: { keys: string[]; arguments: string[] }): Promise<unknown>;
	multi(): RedisMultiLike;
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
