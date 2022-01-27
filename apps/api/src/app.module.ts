import { Module } from '@nestjs/common';
import { FilmographyModule } from './filmography/filmography.module';
import { ServiceProvidersModule } from './service-providers/service-providers.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
	imports: [
		FilmographyModule,
		ServiceProvidersModule,
		ThrottlerModule.forRoot({
			ttl: 60,
			limit: 10,
		}),
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
