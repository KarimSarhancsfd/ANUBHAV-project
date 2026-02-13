import { Injectable } from '@nestjs/common';
import { CreateChatBotDto } from './dto/create-chat-bot.dto';
import { UpdateChatBotDto } from './dto/update-chat-bot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatBot } from './entities/chat-bot.entity';
import { Repository } from 'typeorm';
import { ErrorStatusCodesEnum, Expose, SuccessStatusCodesEnum } from 'src/classes';
import { LanguageManager } from 'src/classes/ResponseLangValidator';

@Injectable()
export class ChatBotService {

  constructor(
    @InjectRepository(ChatBot) private readonly chatBotRepo: Repository<ChatBot>,
    private readonly response: Expose,
    private readonly languageManager: LanguageManager
  ) { }

  async create(body: CreateChatBotDto, user: any) {
    try {
      const chatBot = this.chatBotRepo.create({ ...body, user_id: user.userId })
      const result = await this.chatBotRepo.save(chatBot)
      return this.response.success(
        SuccessStatusCodesEnum.Created,
        this.languageManager.translate('en', 'chat bot created successfully'),
        result
      )
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest, error,

      )
    }
  }

  async findAll() {
    try {
      const result = await this.chatBotRepo.find({ relations: { book_id: true, user_id: true } })
      return this.response.success(
        SuccessStatusCodesEnum.Found,
        this.languageManager.translate('en', "chat bots fetched successfully"),
        result,
        true,
      )
    } catch (error) {
      return this.response.error(
        error.ErrorStatusCodesEnum.BadRequest, error.message,

      )
    }
  }

  async findOne(id: number) {
    try {
      const chatBot = await this.chatBotRepo.findOne({ where: { id } })
      if (!chatBot) throw this.response.error(ErrorStatusCodesEnum.NotFound, 'chat bot not found')
      return this.response.success(
        SuccessStatusCodesEnum.Found,
        this.languageManager.translate("en", 'chat bot fetched successfully'),
        chatBot
      )
    } catch (error) {
      return this.response.error(
        error.ErrorStatusCodesEnum.BadRequest, error.message,

      )
    }
  }

  async update(id: number, body: UpdateChatBotDto) {
    try {
      const chatBot = await this.findOne(id)
      const updatedChatBot = this.chatBotRepo.merge(chatBot.data, { ...body })
      const result = await this.chatBotRepo.save(updatedChatBot)
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        this.languageManager.translate('en', 'chat bot updated successfully')),
        result
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.error.message)
    }
  }

  async remove(id: number) {
    try {
      const chatBot = await this.findOne(id)
      await this.chatBotRepo.remove(chatBot.data)
      return this.response.notify(
        SuccessStatusCodesEnum.Ok,
        this.languageManager.translate('en', 'chatbot deleted successfully')
      )
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.messgae)
    }
  }
}
