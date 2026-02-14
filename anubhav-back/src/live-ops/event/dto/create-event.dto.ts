import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/live-event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Double XP Weekend', description: 'Event title' })
  title: string;

  @IsEnum(EventType)
  @IsNotEmpty()
  @ApiProperty({ example: 'double_xp', description: 'Event type', enum: EventType })
  type: EventType;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    example: { multiplier: 2, duration: 48, message: 'Earn double XP!' },
    description: 'Event payload data',
  })
  payload: Record<string, any>;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    example: '2026-02-20T00:00:00Z',
    description: 'Scheduled trigger time (null for immediate)',
    required: false,
  })
  scheduledAt?: Date;
}
