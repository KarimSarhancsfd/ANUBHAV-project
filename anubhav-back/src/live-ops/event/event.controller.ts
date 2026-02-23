/**
 * @file Event Controller
 * @description REST API controller for managing live events.
 * Provides endpoints to create, retrieve, update, delete, and trigger events.
 */
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

/**
 * @class EventController
 * @description Controller for handling live event CRUD operations and triggering.
 */
@ApiTags('LiveOps Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * @method createEvent
   * @description Creates a new live event.
   * @param {CreateEventDto} dto - The event creation data.
   * @returns {Promise<Object>} The created event.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new live event' })
  async createEvent(@Body() dto: CreateEventDto) {
    return this.eventService.createEvent(dto);
  }

  /**
   * @method getAllEvents
   * @description Retrieves all live events ordered by creation date.
   * @returns {Promise<Array>} Array of all events.
   */
  @Get()
  @ApiOperation({ summary: 'Get all events' })
  async getAllEvents() {
    return this.eventService.getAllEvents();
  }

  /**
   * @method getActiveEvents
   * @description Retrieves all currently active events.
   * @returns {Promise<Array>} Array of active events.
   */
  @Get('active')
  @ApiOperation({ summary: 'Get all active events' })
  async getActiveEvents() {
    return this.eventService.getActiveEvents();
  }

  /**
   * @method getEventById
   * @description Retrieves a specific event by its ID.
   * @param {string} id - The event ID.
   * @returns {Promise<Object>} The event object.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  /**
   * @method updateEvent
   * @description Updates an existing event with new data.
   * @param {string} id - The event ID.
   * @param {Partial<CreateEventDto>} dto - The partial update data.
   * @returns {Promise<Object>} The updated event.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(@Param('id') id: string, @Body() dto: Partial<CreateEventDto>) {
    return this.eventService.updateEvent(id, dto);
  }

  /**
   * @method deleteEvent
   * @description Cancels/deletes an event by setting its status to CANCELLED.
   * @param {string} id - The event ID.
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete/cancel event' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string) {
    await this.eventService.deleteEvent(id);
  }

  /**
   * @method triggerEvent
   * @description Immediately triggers an event, setting its status to ACTIVE.
   * @param {string} id - The event ID to trigger.
   * @returns {Promise<Object>} The triggered event.
   */
  @Post(':id/trigger')
  @ApiOperation({ summary: 'Trigger event immediately' })
  async triggerEvent(@Param('id') id: string) {
    return this.eventService.triggerEvent(id);
  }
}
