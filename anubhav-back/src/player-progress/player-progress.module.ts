import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { PlayerProgressService } from './player-progress.service';
import { PlayerProgressController } from './player-progress.controller';
import { EconomyModule } from '../economy/economy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerProgress]),
    EconomyModule,
  ],
  providers: [PlayerProgressService],
  controllers: [PlayerProgressController],
  exports: [PlayerProgressService],
})
export class PlayerProgressModule {}
