import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupChat } from './entities/user_group_chat.entity';
import { CreateUserGroupChatDto } from './dto/create-user_group_chat.dto';
import { UpdateUserGroupChatDto } from './dto/update-user_group_chat.dto';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class UserGroupChatService {
  constructor(
    @InjectRepository(UserGroupChat)
    private userGroupChatRepo: Repository<UserGroupChat>,

    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  async createUserGroupChat(createUserGroupChatDto: CreateUserGroupChatDto): Promise<UserGroupChat> {
    const newUserGroupChat = this.userGroupChatRepo.create(createUserGroupChatDto);
    return this.userGroupChatRepo.save(newUserGroupChat);
  }

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

  async findAllUserGroupChat(): Promise<UserGroupChat[]> {
    return this.userGroupChatRepo.find();
  }


  async findOneUserGroupChatItem(id: number): Promise<UserGroupChat | string> {
    const userGroupChat = await this.userGroupChatRepo.findOne({ where: { id } });
    if (!userGroupChat) {
      return `User-Group-Chat with id: ${id} not found..!`;
    } else {
      return userGroupChat;
    }
  }

  async updateUserGroupChat(id: number, updateUserGroupChatDto: UpdateUserGroupChatDto): Promise<UserGroupChat | string> {
    const userGroupChat = await this.userGroupChatRepo.findOne({ where: { id } });
    if (!userGroupChat) {
      return `User-Group-Chat with id: ${id} not found..!`;
    } else {
      Object.assign(userGroupChat, updateUserGroupChatDto);
      return this.userGroupChatRepo.save(userGroupChat);
    }
  }


  async removeUserGroupChat(id: number): Promise<void> {
    await this.userGroupChatRepo.delete(id);
  }

  async getPrivateChatHistory(user1Id: number, user2Id: number): Promise<UserGroupChat[]> {
    return this.userGroupChatRepo.find({
      where: [
        { user_id: user1Id, sender_id: user2Id },
        { user_id: user2Id, sender_id: user1Id },
      ],
      order: { id: 'ASC' },
    });
  }

  async getGroupChatHistory(groupId: number): Promise<UserGroupChat[]> {
    return this.userGroupChatRepo.find({
      where: { group_id: groupId },
      order: { id: 'ASC' },
    });
  }
}
