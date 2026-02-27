import { Test, TestingModule } from '@nestjs/testing';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';

describe('TermsController', () => {
  let controller: TermsController;

  const mockTermRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermsController],
      providers: [
        TermsService,
        { provide: getRepositoryToken(Term), useValue: mockTermRepository },
      ],
    }).compile();

    controller = module.get<TermsController>(TermsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
