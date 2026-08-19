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

	@Get('refresh-status')
	async getRefreshStatus() {
		return this.filmographyService.getRefreshStatus();
	}

	@Get(':id')
	async getFilmographyRecord(@Param() params) {
		const { id } = params;
		const recordId = Number(id);
		if (!Number.isInteger(recordId) || recordId <= 0) {
			throw new HttpException('No recordId provided', HttpStatus.BAD_REQUEST);
		}
		return this.filmographyService.getRecord(recordId);
	}
}
