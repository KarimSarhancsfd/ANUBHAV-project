import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { CreateChatBotDto } from './dto/create-chat-bot.dto';
import { UpdateChatBotDto } from './dto/update-chat-bot.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Request } from 'express';

@Controller('api/chat-bot')
@UseGuards(JwtAuthGuard)
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) { }

  @Post()
  create(@Body() createChatBotDto: CreateChatBotDto, @Req() req: Request) {
    return this.chatBotService.create(createChatBotDto, req['user']);
  }

  @Get()
  findAll() {
    return this.chatBotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chatBotService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateChatBotDto: UpdateChatBotDto) {
    return this.chatBotService.update(id, updateChatBotDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chatBotService.remove(id);
  }
}
