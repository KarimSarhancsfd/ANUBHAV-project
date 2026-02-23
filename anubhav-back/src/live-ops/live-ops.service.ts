/**
 * @file LiveOps Service
 * @description Core service for LiveOps operations including system status management,
 * event triggering, config updates, and activity logging.
 */
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

/**
 * @class LiveOpsService
 * @description Service for managing LiveOps system operations including events, configs, and player progression.
 */
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

  /**
   * @method getSystemStatus
   * @description Retrieves the current system status including active events count,
   * config count, and connected clients count. Results are cached for 2 seconds.
   * @returns {Promise<Object>} Object containing status, activeEvents, configCount, connectedClients, and timestamp.
   */
  async getSystemStatus() {
    // PERF: Cache system status for 2s — called on every dashboard load.
    // connectedClients count is a lightweight in-memory read, no DB hit.
    const cached = this.cache.get<ReturnType<typeof this._buildSystemStatus>>(SYSTEM_STATUS_CACHE_KEY);
    if (cached) return cached;

    const status = await this._buildSystemStatus();
    this.cache.set(SYSTEM_STATUS_CACHE_KEY, status, SYSTEM_STATUS_TTL_MS);
    return status;
  }

  /**
   * @method _buildSystemStatus
   * @description Internal method that builds the system status object by fetching
   * active events and config count in parallel.
   * @returns {Promise<Object>} The built system status object.
   * @private
   */
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

  /**
   * @method triggerEvent
   * @description Triggers a live event by ID, broadcasts it to connected clients,
   * and executes type-specific handlers (XP boost, currency grant, stat modification, achievement unlock).
   * @param {string} eventId - The unique identifier of the event to trigger.
   * @returns {Promise<Object>} The triggered event data.
   */
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

  /**
   * @method grantCurrencyToUsers
   * @description Grants currency to multiple users based on the event payload.
   * Executes all grants concurrently for performance.
   * @param {Object} event - The event object containing the payload with userIds, currencyType, amount, and reason.
   * @returns {Promise<Array>} Array of currency transaction results.
   */
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

  /**
   * @method pushConfigUpdate
   * @description Pushes a configuration update to all connected clients via WebSocket.
   * @param {string} key - The configuration key to push.
   * @returns {Promise<Object>} The configuration data that was pushed.
   */
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

  /**
   * @method applyXPBoost
   * @description Applies an XP boost to players. If target is 'ALL', applies a global modifier.
   * Broadcasts the boost to relevant channels.
   * @param {Object} event - The event object containing payload with multiplier, duration, and target.
   * @returns {Promise<void>}
   */
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

  /**
   * @method grantXPToUsers
   * @description Grants XP to multiple users. Uses global XP multiplier from config.
   * Executes all grants in parallel and broadcasts individual progress updates.
   * @param {Object} event - The event object containing payload with userIds and amount.
   * @returns {Promise<Array>} Array of player progress update results.
   */
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

  /**
   * @method modifyPlayerStat
   * @description Modifies a specific player stat and broadcasts the update.
   * @param {Object} event - The event object containing payload with userId, statKey, and value.
   * @returns {Promise<Object>} The updated player progress data.
   */
  async modifyPlayerStat(event: any) {
    const { userId, statKey, value } = event.payload;
    const updated = await this.playerProgressService.modifyStat(userId, statKey, value);
    
    this.realtimeGateway.broadcastToChannel(`user:${userId}`, 'player:progress_update', updated);
    
    await this.logAction(LiveOpsAction.EVENT_TRIGGERED, LiveOpsStatus.SUCCESS, { type: 'MODIFY_STAT', userId, statKey });
    return updated;
  }

  /**
   * @method unlockAchievement
   * @description Unlocks an achievement for a player and broadcasts the unlock event.
   * @param {Object} event - The event object containing payload with userId and achievementKey.
   * @returns {Promise<Object>} The updated player progress data.
   */
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

  /**
   * @method getRecentLogs
   * @description Retrieves recent LiveOps activity logs.
   * @param {number} limit - Maximum number of logs to retrieve (default: 50).
   * @returns {Promise<Array>} Array of log entries ordered by timestamp descending.
   */
  async getRecentLogs(limit: number = 50) {
    return this.logRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * @method logAction
   * @description Internal method to log LiveOps actions to the database.
   * @param {LiveOpsAction} action - The action type being logged.
   * @param {LiveOpsStatus} status - The status of the action (SUCCESS or FAILURE).
   * @param {Record<string, any>} details - Additional details about the action.
   * @param {string} [error] - Optional error message if the action failed.
   * @returns {Promise<void>}
   * @private
   */
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
