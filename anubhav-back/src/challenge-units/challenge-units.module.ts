import { Module } from '@nestjs/common';
import { ChallengeUnitsService } from './challenge-units.service';
import { ChallengeUnitsController } from './challenge-units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeUnit } from './entities/challenge-unit.entity';
import { Expose } from 'src/classes';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeUnit])],
  controllers: [ChallengeUnitsController],
  providers: [ChallengeUnitsService, Expose],
  exports: [ChallengeUnitsService],
})
export class ChallengeUnitsModule { }
