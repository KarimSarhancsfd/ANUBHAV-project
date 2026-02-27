import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeUnitsService } from './challenge-units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChallengeUnit } from './entities/challenge-unit.entity';
import { Expose } from 'src/classes';

describe('ChallengeUnitsService', () => {
  let service: ChallengeUnitsService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  const mockExpose = {
    success: jest.fn(),
    error: jest.fn(),
    notify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeUnitsService,
        { provide: getRepositoryToken(ChallengeUnit), useValue: mockRepo },
        { provide: Expose, useValue: mockExpose },
      ],
    }).compile();

    service = module.get<ChallengeUnitsService>(ChallengeUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
