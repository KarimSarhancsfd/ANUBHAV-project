import { Test, TestingModule } from '@nestjs/testing';
import { TermsService } from './terms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';

describe('TermsService', () => {
  let service: TermsService;

  const mockTermRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermsService,
        { provide: getRepositoryToken(Term), useValue: mockTermRepository },
      ],
    }).compile();

    service = module.get<TermsService>(TermsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
