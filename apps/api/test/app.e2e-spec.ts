import { Test, TestingModule } from '@nestjs/testing';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MovieRecord, ServiceProvider } from 'redis-sdk';
import { AppModule } from '../src/app.module';
import { FilmographyService } from '../src/filmography/service/filmography.service';
import { ServiceProvidersService } from '../src/service-providers/service/service-providers.service';

const movie: MovieRecord = {
	id: 101,
	imdbId: 'tt0101',
	title: 'Test Film',
	poster: '/test-film.jpg',
	originalReleaseYear: 2024,
	tmdbPopularity: 10,
	runtime: 120,
	originalLanguage: 'en',
	ageCertification: 'PG',
	cinemaReleaseDate: '2024-01-01',
	shortDescription: 'A deterministic e2e fixture',
	objectType: 'movie',
	localizedReleaseDate: '2024-01-01',
	offers: [],
	genres: ['Drama'],
};

const provider: ServiceProvider = {
	id: 202,
	technicalName: 'test-provider',
	shortName: 'test',
	clearName: 'Test Provider',
	monetizationTypes: ['flatrate'],
};

describe('Application API (e2e)', () => {
	let app: NestFastifyApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(FilmographyService)
			.useValue({
				getAll: async () => [movie],
				getRecord: async (id: number) => (id === movie.id ? movie : undefined),
			})
			.overrideProvider(ServiceProvidersService)
			.useValue({ getAll: async () => [provider] })
			.compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);
		await app.init();
		await app.getHttpAdapter().getInstance().ready();
	});

	afterEach(async () => {
		await app.close();
	});

	it('serves the movie catalogue and an individual record', async () => {
		const catalogueResponse = await app.inject({
			method: 'GET',
			url: '/filmography',
		});
		const recordResponse = await app.inject({
			method: 'GET',
			url: `/filmography/${movie.id}`,
		});

		expect(catalogueResponse.statusCode).toBe(200);
		expect(catalogueResponse.json()).toEqual([movie]);
		expect(recordResponse.statusCode).toBe(200);
		expect(recordResponse.json()).toEqual(movie);
	});

	it('rejects an invalid movie id', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/filmography/not-a-number',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({ message: 'No recordId provided' });
	});

	it('serves the provider catalogue', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/service-providers',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([provider]);
	});
});
