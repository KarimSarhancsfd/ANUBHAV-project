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
import { AppCacheService } from '../common/cache/app-cache.service';

/** PERF: System status cache TTL — 2 seconds. */
const SYSTEM_STATUS_CACHE_KEY = 'liveops:system_status';
const SYSTEM_STATUS_TTL_MS = 2_000;

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
    // PERF: AppCacheService injected globally via CommonModule
    private readonly cache: AppCacheService,
  ) {}

  async getSystemStatus() {
    // PERF: Cache system status for 2s — called on every dashboard load.
    // connectedClients count is a lightweight in-memory read, no DB hit.
    const cached = this.cache.get<ReturnType<typeof this._buildSystemStatus>>(SYSTEM_STATUS_CACHE_KEY);
    if (cached) return cached;

    const status = await this._buildSystemStatus();
    this.cache.set(SYSTEM_STATUS_CACHE_KEY, status, SYSTEM_STATUS_TTL_MS);
    return status;
  }

  private async _buildSystemStatus() {
    // PERF: Fetch activeEvents and configCount in parallel (both are DB reads).
    const [activeEvents, configCount] = await Promise.all([
      this.eventService.getActiveEvents(),
      this.configService.getConfigCount(),
    ]);
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

    // PERF: Replace sequential for-loop with Promise.all — all currency grants
    // run concurrently instead of one-after-another. Each grant is idempotent
    // (unique idempotency key per event+user), so concurrent execution is safe.
    const results = await Promise.all(
      userIds.map((userId: number) =>
        this.economyService.addCurrency(
          userId,
          currencyType as CurrencyType,
          amount,
          reason || `LiveOps Reward: ${event.title}`,
          TransactionType.REWARD,
          { eventId: event.id },
          `liveops:${event.id}:${userId}`,
        ),
      ),
    );

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

    // PERF: Fetch global multiplier ONCE before the batch — previously this was
    // fetched per-user inside the loop (N DB hits). Now it's a single cached read.
    const globalMultiplier = await this.configService.getConfigValue<number>('progression.xp_multiplier', 1);

    // PERF: Parallelize all XP grants. Each is transactional + idempotent,
    // so concurrent execution is safe. Realtime broadcast sent after each grant.
    const results = await Promise.all(
      userIds.map(async (userId: number) => {
        const updated = await this.playerProgressService.grantXP(userId, amount, globalMultiplier);
        this.realtimeGateway.broadcastToChannel(`user:${userId}`, 'player:progress_update', updated);
        return updated;
      }),
    );

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
