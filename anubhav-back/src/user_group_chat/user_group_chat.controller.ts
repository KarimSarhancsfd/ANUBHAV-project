/**
 * @file user_group_chat.controller.ts
 * @description REST controller for managing user-group chat entities, providing CRUD endpoints.
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserGroupChatService } from './user_group_chat.service';
import { CreateUserGroupChatDto } from './dto/create-user_group_chat.dto';
import { UpdateUserGroupChatDto } from './dto/update-user_group_chat.dto';
import { UserGroupChat } from './entities/user_group_chat.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

/**
 * REST controller for user-group chat operations.
 * All endpoints require JWT authentication.
 */
@Controller('user-group-chat')
@UseGuards(JwtAuthGuard)
export class UserGroupChatController {
  constructor(private readonly userGroupChatService: UserGroupChatService) {}

  /**
   * Creates a new user-group chat message.
   * @param createUserGroupChatDto - Data transfer object containing chat message details
   * @returns The created UserGroupChat entity
   */
  @Post()
  async create(@Body() createUserGroupChatDto: CreateUserGroupChatDto):Promise <UserGroupChat> {
    return this.userGroupChatService.createUserGroupChat(createUserGroupChatDto);
  }

  /**
   * Retrieves all user-group chat messages.
   * @returns An array of all UserGroupChat entities
   */
  @Get()
  async findAll():Promise<UserGroupChat[]>{
    return this.userGroupChatService.findAllUserGroupChat();
  }

  /**
   * Retrieves a single user-group chat message by ID.
   * @param id - The ID of the chat message to retrieve
   * @returns The UserGroupChat entity or an error message if not found
   */
  @Get(':id')
  async findOne(@Param('id') id: string):Promise<UserGroupChat | string> {
    return this.userGroupChatService.findOneUserGroupChatItem(+id);
  }

  /**
   * Updates an existing user-group chat message.
   * @param id - The ID of the chat message to update
   * @param updateUserGroupChatDto - Data transfer object containing updated chat details
   * @returns The updated UserGroupChat entity or an error message if not found
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserGroupChatDto: UpdateUserGroupChatDto):Promise<UserGroupChat | string> {
    return this.userGroupChatService.updateUserGroupChat(+id, updateUserGroupChatDto);
  }

  /**
   * Deletes a user-group chat message by ID.
   * @param id - The ID of the chat message to delete
   */
  @Delete(':id')
  async remove(@Param('id') id: string):Promise<void>  {
    return this.userGroupChatService.removeUserGroupChat(+id);
  }
}
