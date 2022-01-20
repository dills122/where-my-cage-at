import { Test, TestingModule } from '@nestjs/testing';
import { FilmographyService } from './filmography.service';

describe('FilmographyService', () => {
  let service: FilmographyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilmographyService],
    }).compile();

    service = module.get<FilmographyService>(FilmographyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
