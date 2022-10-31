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

	@Get('service-provider/:providerId')
	async getFilmographyRecordsByProvider(@Param() params) {
		const { providerId } = params;
		if (!providerId || Number(providerId) <= 0) {
			throw new HttpException('No providerId given', HttpStatus.BAD_REQUEST);
		}
		return this.filmographyService.getRecordsByProviderId(providerId as number);
	}
}
