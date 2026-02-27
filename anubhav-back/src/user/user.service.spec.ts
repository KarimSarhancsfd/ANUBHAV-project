import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Expose } from 'src/classes';
import { AuthService } from 'src/auth/auth.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUSERRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockExpose = {
    success: jest.fn(),
    error: jest.fn(),
    notify: jest.fn(),
  };

  const mockAuthService = {
    generateAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUSERRepository },
        { provide: Expose, useValue: mockExpose },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
