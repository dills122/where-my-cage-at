import { Test, TestingModule } from '@nestjs/testing';
import { FilmographyController } from './filmography.controller';
import { FilmographyService } from '../service/filmography.service';

describe('FilmographyController', () => {
	let controller: FilmographyController;
	const filmographyService = {
		getAll: jest.fn(),
		getRecord: jest.fn(),
		getRefreshStatus: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FilmographyController],
			providers: [
				{
					provide: FilmographyService,
					useValue: filmographyService,
				},
			],
		}).compile();

		controller = module.get<FilmographyController>(FilmographyController);
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('converts the route id to a number before querying', async () => {
		filmographyService.getRecord.mockResolvedValue({
			id: 1226578,
			title: 'Longlegs',
		});

		await controller.getFilmographyRecord({ id: '1226578' });

		expect(filmographyService.getRecord).toHaveBeenCalledWith(1226578);
	});

	it('returns the latest catalogue refresh status', async () => {
		filmographyService.getRefreshStatus.mockResolvedValue({ state: 'success' });

		await expect(controller.getRefreshStatus()).resolves.toEqual({
			state: 'success',
		});
	});
});
