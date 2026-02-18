import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { PlayerProgressService } from './player-progress.service';
import { PlayerProgressController } from './player-progress.controller';
import { EconomyModule } from '../economy/economy.module';
import { LiveOpsModule } from '../live-ops/live-ops.module';
import { forwardRef } from '@nestjs/common';

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
