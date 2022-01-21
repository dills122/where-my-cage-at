import { Module } from '@nestjs/common';
import { FilmographyModule } from './filmography/filmography.module';
import { ServiceProvidersModule } from './service-providers/service-providers.module';

@Module({
  imports: [FilmographyModule, ServiceProvidersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
