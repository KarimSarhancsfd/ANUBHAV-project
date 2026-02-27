import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupChatService } from './user_group_chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGroupChat } from './entities/user_group_chat.entity';
import { ChatGateway } from 'src/chat/chat.gateway';

describe('UserGroupChatService', () => {
  let service: UserGroupChatService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockChatGateway = {
    server: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGroupChatService,
        { provide: getRepositoryToken(UserGroupChat), useValue: mockRepo },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    }).compile();

    service = module.get<UserGroupChatService>(UserGroupChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
