import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { fastifyHelmet } from 'fastify-helmet';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: __dirname + '/../.env' });

const PORT = process.env.API_PORT || 3000;

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			logger: true,
		}),
	);
	await app.register(fastifyHelmet);
	app.enableCors();
	app.useGlobalPipes(new ValidationPipe());
	//TODO update this with a way to handle envs
	app.useStaticAssets({
		root: join(__dirname, '..', '..', '..', 'data', 'icons'),
		prefix: '/icons',
		cacheControl: true,
		maxAge: 15552000,
	});
	await app.listen(Number(PORT), '0.0.0.0');
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
