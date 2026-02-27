import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupChatController } from './user_group_chat.controller';
import { UserGroupChatService } from './user_group_chat.service';

describe('UserGroupChatController', () => {
  let controller: UserGroupChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGroupChatController],
      providers: [
        {
          provide: UserGroupChatService,
          useValue: {
            createUserGroupChat: jest.fn(),
            sendAndSaveMessage: jest.fn(),
            findAllUserGroupChat: jest.fn(),
            findOneUserGroupChatItem: jest.fn(),
            updateUserGroupChat: jest.fn(),
            removeUserGroupChat: jest.fn(),
            getPrivateChatHistory: jest.fn(),
            getGroupChatHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserGroupChatController>(UserGroupChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
