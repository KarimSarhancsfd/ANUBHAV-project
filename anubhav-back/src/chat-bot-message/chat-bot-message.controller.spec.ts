import { Test, TestingModule } from '@nestjs/testing';
import { ChatBotMessageController } from './chat-bot-message.controller';
import { ChatBotMessageService } from './chat-bot-message.service';

describe('ChatBotMessageController', () => {
  let controller: ChatBotMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatBotMessageController],
      providers: [ChatBotMessageService],
    }).compile();

    controller = module.get<ChatBotMessageController>(ChatBotMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
