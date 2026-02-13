import { Module } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { ChatBotController } from './chat-bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBot } from './entities/chat-bot.entity';
import { Expose } from 'src/classes';
import { LanguageManager } from 'src/classes/ResponseLangValidator';

@Module({
  controllers: [ChatBotController],
  providers: [ChatBotService, Expose, LanguageManager],
  imports: [TypeOrmModule.forFeature([ChatBot])]
})
export class ChatBotModule { }
