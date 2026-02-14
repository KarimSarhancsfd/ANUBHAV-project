import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveOpsLog, LiveOpsAction, LiveOpsStatus } from './entities/liveops-log.entity';
import { EventService } from './event/event.service';
import { ConfigService } from './config/config.service';
import { RealtimeGateway } from './realtime/realtime.gateway';

@Injectable()
export class LiveOpsService {
  constructor(
    @InjectRepository(LiveOpsLog)
    private readonly logRepository: Repository<LiveOpsLog>,
    private readonly eventService: EventService,
    private readonly configService: ConfigService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async getSystemStatus() {
    const activeEvents = await this.eventService.getActiveEvents();
    const configCount = await this.configService.getConfigCount();
    const connectedClients = this.realtimeGateway.getConnectedClientsCount();

    return {
      status: 'operational',
      activeEvents: activeEvents.length,
      configCount,
      connectedClients,
      timestamp: new Date().toISOString(),
    };
  }

  async triggerEvent(eventId: string) {
    const event = await this.eventService.triggerEvent(eventId);
    
    this.realtimeGateway.broadcastEvent('liveops:event', {
      id: event.id,
      title: event.title,
      type: event.type,
      payload: event.payload,
      triggeredAt: new Date().toISOString(),
    });

    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { eventId });
    return event;
  }

  async pushConfigUpdate(key: string) {
    const config = await this.configService.getConfig(key);
    
    this.realtimeGateway.broadcastEvent('liveops:config', {
      key: config.key,
      value: config.value,
      type: config.type,
      version: config.version,
      updatedAt: config.updatedAt,
    });

    await this.logAction(LiveOpsAction.CONFIG_UPDATED, LiveOpsStatus.SUCCESS, { key });
    return config;
  }

  async getRecentLogs(limit: number = 50) {
    return this.logRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  private async logAction(
    action: LiveOpsAction,
    status: LiveOpsStatus,
    details: Record<string, any>,
    error?: string,
  ) {
    const log = this.logRepository.create({
      action,
      status,
      details,
      error,
      timestamp: new Date(),
    });
    await this.logRepository.save(log);
  }
}
