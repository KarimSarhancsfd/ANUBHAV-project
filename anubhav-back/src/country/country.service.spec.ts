import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from './country.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';

describe('CountryService', () => {
  let service: CountryService;

  const mockCountryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        { provide: getRepositoryToken(Country), useValue: mockCountryRepository },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
