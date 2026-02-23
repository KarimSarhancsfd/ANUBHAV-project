/**
 * @file user_group_chat.module.ts
 * @description NestJS module that provides user-group chat functionality, including CRUD operations and WebSocket integration.
 */
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroupChat } from './entities/user_group_chat.entity';
import { UserGroupChatService } from './user_group_chat.service';
import { UserGroupChatController } from './user_group_chat.controller';
import { ChatGateway } from 'src/chat/chat.gateway';

/**
 * User-Group Chat module that configures TypeORM, the chat service, controller, and WebSocket gateway.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserGroupChat]),
    forwardRef(() => ChatGateway),
  ],
  controllers: [UserGroupChatController],
  providers: [UserGroupChatService, ChatGateway],
  exports: [UserGroupChatService],
})
export class UserGroupChatModule {}
