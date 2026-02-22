import { Module } from '@nestjs/common';
import { MatchSessionsService } from './match-sessions.service';
import { MatchSessionsController } from './match-sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchSession } from './entities/match-session.entity';
import { Expose } from 'src/classes';
import { ChallengeUnit } from '../challenge-units/entities/challenge-unit.entity';
import { MatchResult } from './entities/match-result.entity';
import { PlayerProgressModule } from '../player-progress/player-progress.module';
import { ChallengeUnitsModule } from '../challenge-units/challenge-units.module';
import { EconomyModule } from '../economy/economy.module';
import { LiveOpsModule } from '../live-ops/live-ops.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchSession, ChallengeUnit, MatchResult]),
    PlayerProgressModule,
    ChallengeUnitsModule,
    EconomyModule,
    LiveOpsModule,
  ],
  controllers: [MatchSessionsController],
  providers: [MatchSessionsService, Expose],
  exports: [MatchSessionsService],
})
export class MatchSessionsModule {}
