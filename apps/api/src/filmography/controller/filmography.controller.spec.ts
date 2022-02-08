import { Test, TestingModule } from '@nestjs/testing';
import { FilmographyController } from './filmography.controller';

describe('FilmographyController', () => {
	let controller: FilmographyController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FilmographyController],
		}).compile();

		controller = module.get<FilmographyController>(FilmographyController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
