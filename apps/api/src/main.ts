import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { fastifyHelmet } from '@fastify/helmet';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCompress from '@fastify/compress';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: __dirname + '/../.env' });

const PORT = process.env.API_PORT || 3000;

const ENV = process.env.NODE_ENV;

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			logger: true,
		}),
	);
	await app.register(fastifyHelmet, {
		crossOriginResourcePolicy: false,
	});
	app.enableCors({
		origin: [
			'http://localhost:4200',
			'https://localhost:4200',
			'http://localhost:3000',
			'https://localhost:3000',
			'https://wheremycageat.com',
			'https://api.wheremycageat.com',
		],
	});
	app.useGlobalPipes(new ValidationPipe());
	app.register(fastifyCompress);

	const devIconPath = join(__dirname, '..', '..', '..', 'data', 'icons');
	const prodIconPath = join(__dirname, '..', 'icons');

	app.useStaticAssets({
		root: ENV == 'prod' ? prodIconPath : devIconPath,
		prefix: '/icons',
		cacheControl: true,
		maxAge: 15552000,
	});
	await app.listen(Number(PORT), '0.0.0.0');
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
