import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProvidersController } from './service-providers.controller';
import { ServiceProvidersService } from '../service/service-providers.service';

describe('ServiceProvidersController', () => {
	let controller: ServiceProvidersController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ServiceProvidersController],
			providers: [
				{
					provide: ServiceProvidersService,
					useValue: {
						getAll: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<ServiceProvidersController>(
			ServiceProvidersController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
