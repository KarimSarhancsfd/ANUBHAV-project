import { PartialType } from '@nestjs/swagger';
import { CreateUserGroupChatDto } from './create-user_group_chat.dto';

export class UpdateUserGroupChatDto extends PartialType(CreateUserGroupChatDto) {}
