import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserGroupChatService } from './user_group_chat.service';
import { CreateUserGroupChatDto } from './dto/create-user_group_chat.dto';
import { UpdateUserGroupChatDto } from './dto/update-user_group_chat.dto';
import { UserGroupChat } from './entities/user_group_chat.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('user-group-chat')
@UseGuards(JwtAuthGuard)
export class UserGroupChatController {
  constructor(private readonly userGroupChatService: UserGroupChatService) {}

  @Post()
  async create(@Body() createUserGroupChatDto: CreateUserGroupChatDto):Promise <UserGroupChat> {
    return this.userGroupChatService.createUserGroupChat(createUserGroupChatDto);
  }

  @Get()
  async findAll():Promise<UserGroupChat[]>{
    return this.userGroupChatService.findAllUserGroupChat();
  }

  @Get(':id')
  async findOne(@Param('id') id: string):Promise<UserGroupChat | string> {
    return this.userGroupChatService.findOneUserGroupChatItem(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserGroupChatDto: UpdateUserGroupChatDto):Promise<UserGroupChat | string> {
    return this.userGroupChatService.updateUserGroupChat(+id, updateUserGroupChatDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string):Promise<void>  {
    return this.userGroupChatService.removeUserGroupChat(+id);
  }
}
