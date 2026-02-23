/**
 * @file player-progress.module.ts
 * @description NestJS module for player progress feature.
 * Imports required modules and registers the service and controller.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { PlayerProgressService } from './player-progress.service';
import { PlayerProgressController } from './player-progress.controller';
import { EconomyModule } from '../economy/economy.module';
import { LiveOpsModule } from '../live-ops/live-ops.module';
import { forwardRef } from '@nestjs/common';

/**
 * NestJS module for player progress functionality.
 * Provides the PlayerProgressService and PlayerProgressController,
 * and imports Economy and LiveOps modules for cross-feature functionality.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerProgress]),
    EconomyModule,
    forwardRef(() => LiveOpsModule),
  ],
  providers: [PlayerProgressService],
  controllers: [PlayerProgressController],
  exports: [PlayerProgressService],
})
export class PlayerProgressModule {}
