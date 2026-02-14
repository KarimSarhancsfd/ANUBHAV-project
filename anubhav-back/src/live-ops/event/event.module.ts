import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { LiveEvent } from './entities/live-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveEvent])],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
