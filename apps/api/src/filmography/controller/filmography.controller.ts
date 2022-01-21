import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { MovieRecord } from 'redis-sdk';
import { FilmographyService } from '../service/filmography.service';

@Controller('filmography')
export class FilmographyController {
  constructor(private readonly filmographyService: FilmographyService) {}

  @Get()
  async findAll(): Promise<MovieRecord[]> {
    return this.filmographyService.getAll();
  }

  @Get(':id')
  async getFilmographyRecord(@Param() params) {
    const { id } = params;
    if (!id || Number(id) <= 0) {
      throw new HttpException('No recordId provided', HttpStatus.BAD_REQUEST);
    }
    return this.filmographyService.getRecord(id as number);
  }
}
