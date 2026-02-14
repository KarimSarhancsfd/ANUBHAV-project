import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('LiveOps Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new live event' })
  async createEvent(@Body() dto: CreateEventDto) {
    return this.eventService.createEvent(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  async getAllEvents() {
    return this.eventService.getAllEvents();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active events' })
  async getActiveEvents() {
    return this.eventService.getActiveEvents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(@Param('id') id: string, @Body() dto: Partial<CreateEventDto>) {
    return this.eventService.updateEvent(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/cancel event' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string) {
    await this.eventService.deleteEvent(id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Trigger event immediately' })
  async triggerEvent(@Param('id') id: string) {
    return this.eventService.triggerEvent(id);
  }
}
