import { Module } from '@nestjs/common';
import { ServiceProvidersController } from './controller/service-providers.controller';
import { ServiceProvidersService } from './service/service-providers.service';

@Module({
	controllers: [ServiceProvidersController],
	providers: [ServiceProvidersService],
})
export class ServiceProvidersModule {}
