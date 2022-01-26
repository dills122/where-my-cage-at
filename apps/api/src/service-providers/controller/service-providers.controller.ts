import {
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	StreamableFile,
	Response,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ServiceProvider } from 'redis-sdk';
import { ServiceProvidersService } from '../service/service-providers.service';

@Controller('service-providers')
export class ServiceProvidersController {
	constructor(
		private readonly serviceProviderService: ServiceProvidersService,
	) {}

	@Get()
	async findAll(): Promise<ServiceProvider[]> {
		return this.serviceProviderService.getAll();
	}

	@Get('icon/:id')
	getServiceIcon(
		@Param() params,
		@Response({ passthrough: true }) res,
	): StreamableFile {
		const { id } = params;
		if (!id || Number(id) <= 0) {
			throw new HttpException('No recordId provided', HttpStatus.BAD_REQUEST);
		}
		//TODO need to update this with a prod v. dev file path
		const file = createReadStream(
			join(process.cwd(), '..', '..', '..', 'data', 'icons', `${id}.webp`),
		);
		res.set({
			'Content-Type': 'image/webp',
			'Content-Disposition': `attachment; filename="${id}.webp"`,
		});
		return new StreamableFile(file);
	}
	//TODO create an endpoint that zips all of the images and sends as one package
}
