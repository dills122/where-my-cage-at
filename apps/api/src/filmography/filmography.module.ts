import { Module } from '@nestjs/common';
import { FilmographyService } from './service/filmography.service';
import { FilmographyController } from './controller/filmography.controller';

@Module({
	controllers: [FilmographyController],
	providers: [FilmographyService],
})
export class FilmographyModule {}
