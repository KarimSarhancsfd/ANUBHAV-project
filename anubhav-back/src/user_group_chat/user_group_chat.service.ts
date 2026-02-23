/**
 * @file user_group_chat.service.ts
 * @description Service layer for user-group chat operations, handling CRUD logic and real-time message delivery.
 */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupChat } from './entities/user_group_chat.entity';
import { CreateUserGroupChatDto } from './dto/create-user_group_chat.dto';
import { UpdateUserGroupChatDto } from './dto/update-user_group_chat.dto';
import { ChatGateway } from 'src/chat/chat.gateway';

/**
 * Service for managing user-group chat entities and real-time message broadcasting.
 */
@Injectable()
export class UserGroupChatService {
  constructor(
    @InjectRepository(UserGroupChat)
    private userGroupChatRepo: Repository<UserGroupChat>,

    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  /**
   * Creates a new user-group chat message in the database.
   * @param createUserGroupChatDto - Data transfer object containing chat message details
   * @returns The newly created UserGroupChat entity
   */
  async createUserGroupChat(createUserGroupChatDto: CreateUserGroupChatDto): Promise<UserGroupChat> {
    const newUserGroupChat = this.userGroupChatRepo.create(createUserGroupChatDto);
    return this.userGroupChatRepo.save(newUserGroupChat);
  }

  /**
   * Saves a message and broadcasts it to the appropriate recipients via WebSocket.
   * @param createUserGroupChatDto - Data transfer object containing chat message details
   * @returns The saved UserGroupChat entity with broadcasted message
   */
  async sendAndSaveMessage(createUserGroupChatDto: CreateUserGroupChatDto): Promise<UserGroupChat> {
    const savedMessage = await this.createUserGroupChat(createUserGroupChatDto);

    // Determine if it's a group or private message
    if (createUserGroupChatDto.group_id && createUserGroupChatDto.group_id !== 0) {
      // Group chat
      this.chatGateway.server.to(`group_${createUserGroupChatDto.group_id}`).emit('receiveGroupMessage', savedMessage);
    } else {
      // Private chat
      this.chatGateway.server.to(`user_${createUserGroupChatDto.user_id}`).emit('receivePrivateMessage', savedMessage);
    }

    return savedMessage;
  }

  /**
   * Retrieves all user-group chat messages.
   * @returns An array of all UserGroupChat entities
   */
  async findAllUserGroupChat(): Promise<UserGroupChat[]> {
    return this.userGroupChatRepo.find();
  }


  /**
   * Retrieves a single user-group chat message by ID.
   * @param id - The ID of the chat message to retrieve
   * @returns The UserGroupChat entity or an error message if not found
   */
  async findOneUserGroupChatItem(id: number): Promise<UserGroupChat | string> {
    const userGroupChat = await this.userGroupChatRepo.findOne({ where: { id } });
    if (!userGroupChat) {
      return `User-Group-Chat with id: ${id} not found..!`;
    } else {
      return userGroupChat;
    }
  }

  /**
   * Updates an existing user-group chat message.
   * @param id - The ID of the chat message to update
   * @param updateUserGroupChatDto - Data transfer object containing updated chat details
   * @returns The updated UserGroupChat entity or an error message if not found
   */
  async updateUserGroupChat(id: number, updateUserGroupChatDto: UpdateUserGroupChatDto): Promise<UserGroupChat | string> {
    const userGroupChat = await this.userGroupChatRepo.findOne({ where: { id } });
    if (!userGroupChat) {
      return `User-Group-Chat with id: ${id} not found..!`;
    } else {
      Object.assign(userGroupChat, updateUserGroupChatDto);
      return this.userGroupChatRepo.save(userGroupChat);
    }
  }


  /**
   * Deletes a user-group chat message by ID.
   * @param id - The ID of the chat message to delete
   */
  async removeUserGroupChat(id: number): Promise<void> {
    await this.userGroupChatRepo.delete(id);
  }

  /**
   * Retrieves private chat history between two users.
   * @param user1Id - The ID of the first user
   * @param user2Id - The ID of the second user
   * @returns An array of UserGroupChat messages between the two users
   */
  async getPrivateChatHistory(user1Id: number, user2Id: number): Promise<UserGroupChat[]> {
    return this.userGroupChatRepo.find({
      where: [
        { user_id: user1Id, sender_id: user2Id },
        { user_id: user2Id, sender_id: user1Id },
      ],
      order: { id: 'ASC' },
    });
  }

  /**
   * Retrieves chat history for a specific group.
   * @param groupId - The ID of the group
   * @returns An array of UserGroupChat messages in the group
   */
  async getGroupChatHistory(groupId: number): Promise<UserGroupChat[]> {
    return this.userGroupChatRepo.find({
      where: { group_id: groupId },
      order: { id: 'ASC' },
    });
  }
}
