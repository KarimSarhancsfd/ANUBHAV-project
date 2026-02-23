/**
 * @file LiveOps Module
 * @description NestJS module that aggregates LiveOps functionality including events,
 * configuration management, real-time updates, player progress, and economy integration.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveOpsService } from './live-ops.service';
import { LiveOpsController } from './live-ops.controller';
import { EventModule } from './event/event.module';
import { ConfigModule } from './config/config.module';
import { RealtimeModule } from './realtime/realtime.module';
import { LiveOpsLog } from './entities/liveops-log.entity';
import { PlayerProgressModule } from '../player-progress/player-progress.module';
import { EconomyModule } from '../economy/economy.module';
import { forwardRef } from '@nestjs/common';

/**
 * @class LiveOpsModule
 * @description Root module for LiveOps feature that coordinates event management,
 * remote configuration, real-time communication, and player progression systems.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LiveOpsLog]),
    EventModule,
    ConfigModule,
    RealtimeModule,
    forwardRef(() => PlayerProgressModule),
    EconomyModule,
  ],
  providers: [LiveOpsService],
  controllers: [LiveOpsController],
  exports: [LiveOpsService],
})
export class LiveOpsModule {}
