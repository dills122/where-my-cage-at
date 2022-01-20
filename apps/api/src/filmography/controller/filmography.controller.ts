import { Controller, Get } from '@nestjs/common';
import { MovieRecord } from 'redis-sdk';
import { FilmographyService } from '../service/filmography.service';

@Controller('filmography')
export class FilmographyController {
  constructor(private readonly filmographyService: FilmographyService) {}

  @Get()
  async findAll(): Promise<MovieRecord[]> {
    return this.filmographyService.getAll();
  }
}
