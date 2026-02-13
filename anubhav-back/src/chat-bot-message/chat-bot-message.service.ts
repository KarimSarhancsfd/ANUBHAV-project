import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatBotMessage } from './entities/chat-bot-message.entity';
import { Repository } from 'typeorm';
import { CreateChatBotMessageDto } from './dto/create-chat-bot-message.dto';
import { UpdateChatBotMessageDto } from './dto/update-chat-bot-message.dto';

@Injectable()
export class ChatBotMessageService {

  constructor(
    @InjectRepository(ChatBotMessage) private readonly chatBotMessage: Repository<ChatBotMessage>
  ) { }

  async create({ archive, image_url, message, record_url }: CreateChatBotMessageDto) {
    if (!archive || !image_url || !message || !record_url) throw new BadRequestException('chat bot messgae not found')
    const chatBotMessage = this.chatBotMessage.create({ archive, image_url, message, record_url })
    return await this.chatBotMessage.save(chatBotMessage)
  }

  async findAll() {
    return await this.chatBotMessage.find()
  }

  async findOne(id: number) {
    const chatBotMessage = await this.chatBotMessage.findOne({ where: { id } })
    if (!chatBotMessage) throw new NotFoundException('chat bot message not found')
    return chatBotMessage
  }

  async update(id: number, { archive, image_url, message, record_url }: UpdateChatBotMessageDto) {
    const chatBotMessage = await this.findOne(id)
    const updatedChatBotMessage = this.chatBotMessage.merge(chatBotMessage, { archive, image_url, message, record_url })
    return await this.chatBotMessage.save(updatedChatBotMessage)
  }

  async remove(id: number) {
    const chatBotMessage = await this.findOne(id)
    await this.chatBotMessage.remove(chatBotMessage)
    return { message: 'chat bot message deleted successfully' }
  }
}

