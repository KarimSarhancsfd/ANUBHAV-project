import { Test, TestingModule } from '@nestjs/testing';
import { MatchSessionsController } from './match-sessions.controller';
import { MatchSessionsService } from './match-sessions.service';

describe('MatchSessionsController', () => {
  let controller: MatchSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchSessionsController],
      providers: [
        {
          provide: MatchSessionsService,
          useValue: {
            createSession: jest.fn(),
            findAllSessions: jest.fn(),
            findSessionById: jest.fn(),
            updateSession: jest.fn(),
            removeSession: jest.fn(),
            submitSessionResults: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MatchSessionsController>(MatchSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
