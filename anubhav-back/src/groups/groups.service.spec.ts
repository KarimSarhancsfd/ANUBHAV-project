import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GROUPS } from './entities/group.entity';
import { Repository } from 'typeorm';

describe('GroupsService', () => {
  let service: GroupsService;
  let userRepository: Repository<GROUPS>;

  const mockGROUPSRepository = {
 create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService, {provide: getRepositoryToken(GROUPS), useValue: mockGROUPSRepository}],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    userRepository = module.get<Repository<GROUPS>>(getRepositoryToken(GROUPS));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
