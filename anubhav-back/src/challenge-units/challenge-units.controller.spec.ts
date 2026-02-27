import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeUnitsController } from './challenge-units.controller';
import { ChallengeUnitsService } from './challenge-units.service';

describe('ChallengeUnitsController', () => {
  let controller: ChallengeUnitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengeUnitsController],
      providers: [
        {
          provide: ChallengeUnitsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            submitAnswer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChallengeUnitsController>(ChallengeUnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
