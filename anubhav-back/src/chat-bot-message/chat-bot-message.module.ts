import { Module } from '@nestjs/common';
import { ChatBotMessageService } from './chat-bot-message.service';
import { ChatBotMessageController } from './chat-bot-message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBotMessage } from './entities/chat-bot-message.entity';

@Module({
  controllers: [ChatBotMessageController],
  providers: [ChatBotMessageService],
  imports: [TypeOrmModule.forFeature([ChatBotMessage])]
})
export class ChatBotMessageModule { }
