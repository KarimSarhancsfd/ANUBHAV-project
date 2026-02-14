import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveEvent, EventStatus, EventType } from './entities/live-event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(LiveEvent)
    private readonly eventRepository: Repository<LiveEvent>,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<LiveEvent> {
    const event = this.eventRepository.create({
      ...dto,
      status: dto.scheduledAt ? EventStatus.SCHEDULED : EventStatus.ACTIVE,
      triggeredAt: dto.scheduledAt ? null : new Date(),
    });
    return this.eventRepository.save(event);
  }

  async getAllEvents(): Promise<LiveEvent[]> {
    return this.eventRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveEvents(): Promise<LiveEvent[]> {
    return this.eventRepository.find({
      where: { status: EventStatus.ACTIVE },
      order: { triggeredAt: 'DESC' },
    });
  }

  async getEventById(id: string): Promise<LiveEvent> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async updateEvent(id: string, dto: Partial<CreateEventDto>): Promise<LiveEvent> {
    const event = await this.getEventById(id);
    Object.assign(event, dto);
    return this.eventRepository.save(event);
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    event.status = EventStatus.CANCELLED;
    await this.eventRepository.save(event);
  }

  async triggerEvent(id: string): Promise<LiveEvent> {
    const event = await this.getEventById(id);
    event.status = EventStatus.ACTIVE;
    event.triggeredAt = new Date();
    return this.eventRepository.save(event);
  }

  async getScheduledEvents(): Promise<LiveEvent[]> {
    return this.eventRepository.find({
      where: { status: EventStatus.SCHEDULED },
      order: { scheduledAt: 'ASC' },
    });
  }
}
