import { PartialType } from '@nestjs/swagger';
import { CreateChatBotMessageDto } from './create-chat-bot-message.dto';

export class UpdateChatBotMessageDto extends PartialType(CreateChatBotMessageDto) {}
