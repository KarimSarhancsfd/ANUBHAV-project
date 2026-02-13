import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupChatService } from './user_group_chat.service';

describe('UserGroupChatService', () => {
  let service: UserGroupChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGroupChatService],
    }).compile();

    service = module.get<UserGroupChatService>(UserGroupChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
