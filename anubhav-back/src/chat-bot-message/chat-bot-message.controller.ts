import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ChatBotMessageService } from './chat-bot-message.service';
import { CreateChatBotMessageDto } from './dto/create-chat-bot-message.dto';
import { UpdateChatBotMessageDto } from './dto/update-chat-bot-message.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('chat-bot-message')
@UseGuards(JwtAuthGuard)
export class ChatBotMessageController {
  constructor(private readonly chatBotMessageService: ChatBotMessageService) { }

  @Post()
  create(@Body() createChatBotMessageDto: CreateChatBotMessageDto) {
    return this.chatBotMessageService.create(createChatBotMessageDto);
  }

  @Get()
  findAll() {
    return this.chatBotMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chatBotMessageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateChatBotMessageDto: UpdateChatBotMessageDto) {
    return this.chatBotMessageService.update(id, updateChatBotMessageDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chatBotMessageService.remove(id);
  }
}
