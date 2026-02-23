/**
 * @file Event Module
 * @description NestJS module for managing live events functionality.
 * Provides event CRUD operations and status management.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { LiveEvent } from './entities/live-event.entity';

/**
 * @class EventModule
 * @description Module for handling live events with TypeORM integration.
 */
@Module({
  imports: [TypeOrmModule.forFeature([LiveEvent])],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
