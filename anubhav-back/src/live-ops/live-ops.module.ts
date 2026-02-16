import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveOpsService } from './live-ops.service';
import { LiveOpsController } from './live-ops.controller';
import { EventModule } from './event/event.module';
import { ConfigModule } from './config/config.module';
import { RealtimeModule } from './realtime/realtime.module';
import { LiveOpsLog } from './entities/liveops-log.entity';
import { PlayerProgressModule } from '../player-progress/player-progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveOpsLog]),
    EventModule,
    ConfigModule,
    RealtimeModule,
    PlayerProgressModule,
  ],
  providers: [LiveOpsService],
  controllers: [LiveOpsController],
  exports: [LiveOpsService],
})
export class LiveOpsModule {}
