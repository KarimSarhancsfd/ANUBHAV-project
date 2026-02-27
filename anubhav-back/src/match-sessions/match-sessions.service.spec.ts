import { Test, TestingModule } from '@nestjs/testing';
import { MatchSessionsService } from './match-sessions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchSession } from './entities/match-session.entity';
import { MatchResult } from './entities/match-result.entity';
import { ChallengeUnitsService } from '../challenge-units/challenge-units.service';
import { PlayerProgressService } from '../player-progress/player-progress.service';
import { EconomyService } from '../economy/economy.service';
import { LiveOpsService } from '../live-ops/live-ops.service';
import { Expose } from 'src/classes';

describe('MatchSessionsService', () => {
  let service: MatchSessionsService;

  const mockSessionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn().mockReturnValue({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
          manager: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        }),
      },
    },
  };

  const mockResultRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockChallengeUnitsService = { create: jest.fn() };
  const mockPlayerProgressService = { grantXP: jest.fn() };
  const mockEconomyService = { addCurrency: jest.fn() };
  const mockLiveOpsService = {};
  const mockExpose = {
    success: jest.fn(),
    error: jest.fn(),
    notify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchSessionsService,
        { provide: getRepositoryToken(MatchSession), useValue: mockSessionRepo },
        { provide: getRepositoryToken(MatchResult), useValue: mockResultRepo },
        { provide: ChallengeUnitsService, useValue: mockChallengeUnitsService },
        { provide: PlayerProgressService, useValue: mockPlayerProgressService },
        { provide: EconomyService, useValue: mockEconomyService },
        { provide: LiveOpsService, useValue: mockLiveOpsService },
        { provide: Expose, useValue: mockExpose },
      ],
    }).compile();

    service = module.get<MatchSessionsService>(MatchSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
