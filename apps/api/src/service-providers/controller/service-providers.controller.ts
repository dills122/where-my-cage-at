import { Controller, Get } from '@nestjs/common';
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
}
