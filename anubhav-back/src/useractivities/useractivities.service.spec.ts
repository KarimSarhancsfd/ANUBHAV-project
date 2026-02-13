import { Test, TestingModule } from '@nestjs/testing';
import { UserActivitiesService } from './useractivities.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserActivities} from './entities/useractivities.entity';
import { Repository } from 'typeorm';

describe('UserActivitiesService', () => {
  let service: UserActivitiesService;
  let userRepository: Repository<UserActivities>;

  const mockUSERACTIVITIESRepository = {
 create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserActivitiesService, {provide: getRepositoryToken(UserActivities), useValue: mockUSERACTIVITIESRepository}],
    }).compile();

    service = module.get<UserActivitiesService>(UserActivitiesService);
    userRepository = module.get<Repository<UserActivities>>(getRepositoryToken(UserActivities));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
