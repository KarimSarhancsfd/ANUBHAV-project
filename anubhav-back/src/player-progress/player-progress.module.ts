import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { PlayerProgressService } from './player-progress.service';
import { PlayerProgressController } from './player-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerProgress])],
  providers: [PlayerProgressService],
  controllers: [PlayerProgressController],
  exports: [PlayerProgressService],
})
export class PlayerProgressModule {}
