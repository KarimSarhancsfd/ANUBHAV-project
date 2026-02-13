import { Test, TestingModule } from '@nestjs/testing';
import { ChatBotMessageService } from './chat-bot-message.service';

describe('ChatBotMessageService', () => {
  let service: ChatBotMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatBotMessageService],
    }).compile();

    service = module.get<ChatBotMessageService>(ChatBotMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
