import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveOpsLog, LiveOpsAction, LiveOpsStatus } from './entities/liveops-log.entity';
import { EventService } from './event/event.service';
import { ConfigService } from './config/config.service';
import { RealtimeGateway } from './realtime/realtime.gateway';
import { PlayerProgressService } from '../player-progress/player-progress.service';
import { EventType } from './event/entities/live-event.entity';
import { EconomyService } from '../economy/economy.service';
import { CurrencyType, TransactionType } from '../economy/enums/economy.enums';

@Injectable()
export class LiveOpsService {
  private readonly logger = new Logger(LiveOpsService.name);

  constructor(
    @InjectRepository(LiveOpsLog)
    private readonly logRepository: Repository<LiveOpsLog>,
    private readonly eventService: EventService,
    private readonly configService: ConfigService,
    private readonly realtimeGateway: RealtimeGateway,
    @Inject(forwardRef(() => PlayerProgressService))
    private readonly playerProgressService: PlayerProgressService,
    private readonly economyService: EconomyService,
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
    
    // Broadcast generic liveops event
    this.realtimeGateway.broadcastEvent('liveops:event', {
      id: event.id,
      title: event.title,
      type: event.type,
      payload: event.payload,
      triggeredAt: new Date().toISOString(),
    });

    // Handle specific progression event types
    switch (event.type) {
      case EventType.DOUBLE_XP:
      case EventType.XP_BOOST:
        await this.applyXPBoost(event);
        break;
      case EventType.GRANT_XP:
        await this.grantXPToUsers(event);
        break;
      case EventType.GRANT_CURRENCY:
        await this.grantCurrencyToUsers(event);
        break;
      case EventType.MODIFY_STAT:
        await this.modifyPlayerStat(event);
        break;
      case EventType.UNLOCK_ACHIEVEMENT:
        await this.unlockAchievement(event);
        break;
      default:
        this.logger.debug(`No specific handler for event type: ${event.type}`);
    }

    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { eventId });
    return event;
  }

  async grantCurrencyToUsers(event: any) {
    const { userIds, currencyType, amount, reason } = event.payload;
    const results: any[] = [];
    
    for (const userId of userIds) {
      const wallet = await this.economyService.addCurrency(
        userId,
        currencyType as CurrencyType,
        amount,
        reason || `LiveOps Reward: ${event.title}`,
        TransactionType.REWARD,
        { eventId: event.id },
        `liveops:${event.id}:${userId}`, // Idempotency key
      );
      results.push(wallet);
    }

    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { type: 'GRANT_CURRENCY', count: userIds.length });
    return results;
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

  async applyXPBoost(event: any) {
    const { multiplier, duration, target } = event.payload;
    if (target === 'ALL') {
      await this.playerProgressService.applyGlobalModifier({ type: 'XP_BOOST', value: multiplier });
    }
    
    this.realtimeGateway.broadcastEvent('player:xp_boost', {
      multiplier,
      duration,
      target,
    });

    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { type: 'XP_BOOST', multiplier });
  }

  async grantXPToUsers(event: any) {
    const { userIds, amount } = event.payload;
    const results: any[] = [];
    
    // Fetch global multiplier from remote config
    const globalMultiplier = await this.configService.getConfigValue<number>('progression.xp_multiplier', 1);
    
    for (const userId of userIds) {
      const updated = await this.playerProgressService.grantXP(userId, amount, globalMultiplier);
      results.push(updated);
      
      this.realtimeGateway.broadcastToChannel(`user:${userId}`, 'player:progress_update', updated);
    }

    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { type: 'GRANT_XP', count: userIds.length });
    return results;
  }

  async modifyPlayerStat(event: any) {
    const { userId, statKey, value } = event.payload;
    const updated = await this.playerProgressService.modifyStat(userId, statKey, value);
    
    this.realtimeGateway.broadcastToChannel(`user:${userId}`, 'player:progress_update', updated);
    
    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { type: 'MODIFY_STAT', userId, statKey });
    return updated;
  }

  async unlockAchievement(event: any) {
    const { userId, achievementKey } = event.payload;
    const updated = await this.playerProgressService.unlockAchievement(userId, achievementKey);
    
    this.realtimeGateway.broadcastToChannel(`user:${userId}`, 'player:achievement_unlocked', {
      achievementKey,
      progress: updated,
    });

    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { type: 'UNLOCK_ACHIEVEMENT', userId, achievementKey });
    return updated;
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
