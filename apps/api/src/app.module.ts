import { Module } from '@nestjs/common';
import { FilmographyModule } from './filmography/filmography.module';

@Module({
  imports: [FilmographyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
