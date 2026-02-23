/**
 * @file chat.module.ts
 * @description NestJS module that provides the chat WebSocket gateway for real-time communication.
 */
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

/**
 * Chat module that registers the ChatGateway for WebSocket handling.
 * Exports the gateway for use in other modules.
 */
@Module({
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
