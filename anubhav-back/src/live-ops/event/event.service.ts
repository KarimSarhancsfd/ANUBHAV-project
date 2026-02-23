/**
 * @file Event Service
 * @description Service for managing live events including creation, retrieval,
 * updates, and status management.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveEvent, EventStatus, EventType } from './entities/live-event.entity';
import { CreateEventDto } from './dto/create-event.dto';

/**
 * @class EventService
 * @description Service for handling live event business logic and persistence.
 */
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(LiveEvent)
    private readonly eventRepository: Repository<LiveEvent>,
  ) {}

  /**
   * @method createEvent
   * @description Creates a new live event. If scheduledAt is provided, the event
   * is created with SCHEDULED status; otherwise it's ACTIVE immediately.
   * @param {CreateEventDto} dto - The event creation data.
   * @returns {Promise<Object>} The created event.
   */
  async createEvent(dto: CreateEventDto): Promise<LiveEvent> {
    const event = this.eventRepository.create({
      ...dto,
      status: dto.scheduledAt ? EventStatus.SCHEDULED : EventStatus.ACTIVE,
      triggeredAt: dto.scheduledAt ? null : new Date(),
    });
    return this.eventRepository.save(event);
  }

  /**
   * @method getAllEvents
   * @description Retrieves all events ordered by creation date descending.
   * @returns {Promise<Array>} Array of all events.
   */
  async getAllEvents(): Promise<LiveEvent[]> {
    return this.eventRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method getActiveEvents
   * @description Retrieves all currently active events ordered by trigger time.
   * @returns {Promise<Array>} Array of active events.
   */
  async getActiveEvents(): Promise<LiveEvent[]> {
    return this.eventRepository.find({
      where: { status: EventStatus.ACTIVE },
      order: { triggeredAt: 'DESC' },
    });
  }

  /**
   * @method getEventById
   * @description Retrieves a specific event by its ID.
   * @param {string} id - The event ID.
   * @returns {Promise<Object>} The event object.
   * @throws {NotFoundException} If the event is not found.
   */
  async getEventById(id: string): Promise<LiveEvent> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  /**
   * @method updateEvent
   * @description Updates an existing event with new data.
   * @param {string} id - The event ID.
   * @param {Partial<CreateEventDto>} dto - The partial update data.
   * @returns {Promise<Object>} The updated event.
   */
  async updateEvent(id: string, dto: Partial<CreateEventDto>): Promise<LiveEvent> {
    const event = await this.getEventById(id);
    Object.assign(event, dto);
    return this.eventRepository.save(event);
  }

  /**
   * @method deleteEvent
   * @description Cancels an event by setting its status to CANCELLED.
   * @param {string} id - The event ID.
   * @returns {Promise<void>}
   */
  async deleteEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    event.status = EventStatus.CANCELLED;
    await this.eventRepository.save(event);
  }

  /**
   * @method triggerEvent
   * @description Immediately triggers an event, setting its status to ACTIVE
   * and recording the trigger timestamp.
   * @param {string} id - The event ID.
   * @returns {Promise<Object>} The triggered event.
   */
  async triggerEvent(id: string): Promise<LiveEvent> {
    const event = await this.getEventById(id);
    event.status = EventStatus.ACTIVE;
    event.triggeredAt = new Date();
    return this.eventRepository.save(event);
  }

  /**
   * @method getScheduledEvents
   * @description Retrieves all scheduled events ordered by scheduled time.
   * @returns {Promise<Array>} Array of scheduled events.
   */
  async getScheduledEvents(): Promise<LiveEvent[]> {
    return this.eventRepository.find({
      where: { status: EventStatus.SCHEDULED },
      order: { scheduledAt: 'ASC' },
    });
  }
}
