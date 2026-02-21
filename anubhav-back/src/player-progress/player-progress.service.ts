import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { EconomyService } from '../economy/economy.service';
import { CurrencyType, TransactionType } from '../economy/enums/economy.enums';
import { LiveOpsService } from '../live-ops/live-ops.service';
import { AppCacheService } from '../common/cache/app-cache.service';

/** PERF: Short-lived read cache for player progress — avoids repeated DB hits
 *  on the hot getProgress() path (called by dashboard + /me + grantXP).
 *  5 seconds is safe since progress can only change via explicit write endpoints. */
const PROGRESS_CACHE_TTL_MS = 5_000;

function progressCacheKey(userId: number) {
  return `progress:${userId}`;
}

@Injectable()
export class PlayerProgressService {
  private readonly logger = new Logger(PlayerProgressService.name);

  constructor(
    @InjectRepository(PlayerProgress)
    private readonly progressRepository: Repository<PlayerProgress>,
    private readonly economyService: EconomyService,
    @Inject(forwardRef(() => LiveOpsService))
    private readonly liveOpsService: LiveOpsService,
    private readonly dataSource: DataSource,
    // PERF: Global cache service injected via CommonModule
    private readonly cache: AppCacheService,
  ) {}

  async getDashboardData(userId: number) {
    // PERF: All three reads run in parallel — previously sequential.
    // getProgress now serves from cache on the 2nd+ call within 5s.
    const [progress, wallet, liveOpsStatus] = await Promise.all([
      this.getProgress(userId),
      this.economyService.getWallet(userId),
      this.liveOpsService.getSystemStatus(),
    ]);

    return {
      userId,
      progress: {
        level: progress.level,
        xp: progress.xp,
        // PERF: Compute nextLevelXp inline — no extra DB call, pure arithmetic.
        nextLevelXp: Math.pow(progress.level, 2) * 100,
        stats: progress.stats,
        achievements: progress.achievements,
      },
      economy: {
        coins: wallet.coins,
        gems: wallet.gems,
      },
      liveOps: {
        activeEvents: liveOpsStatus.activeEvents,
        status: liveOpsStatus.status,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getProgress(userId: number): Promise<PlayerProgress> {
    // PERF: Serve from 5s cache on repeated reads (dashboard + /me are called frequently
    // by the Angular frontend on every login and route navigation).
    const cached = this.cache.get<PlayerProgress>(progressCacheKey(userId));
    if (cached) return cached;

    let progress = await this.progressRepository.findOne({
      where: { userId },
      // PERF: Select only fields the application reads — avoids transferring full entity.
      select: ['id', 'userId', 'level', 'xp', 'stats', 'skills', 'achievements'],
    });

    if (!progress) {
      // Initialize progress if not found
      progress = this.progressRepository.create({
        userId,
        level: 1,
        xp: 0,
        stats: {},
        skills: {},
        achievements: {},
      });
      await this.progressRepository.save(progress);
    }

    // PERF: Cache the result for 5s — invalidated on any write to this user's progress.
    this.cache.set(progressCacheKey(userId), progress, PROGRESS_CACHE_TTL_MS);
    return progress;
  }

  async grantXP(userId: number, amount: number, multiplier: number = 1, manager?: EntityManager): Promise<PlayerProgress> {
    // If a manager is provided, use it (part of an external transaction).
    // Otherwise, start a new transaction using the dataSource.
    if (manager) {
      return this._performGrantXP(manager, userId, amount, multiplier);
    }

    return await this.dataSource.transaction(async (m: EntityManager) => {
      return this._performGrantXP(m, userId, amount, multiplier);
    });
  }

  private async _performGrantXP(manager: EntityManager, userId: number, amount: number, multiplier: number = 1): Promise<PlayerProgress> {
    let progress = await manager.findOne(PlayerProgress, {
      where: { userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!progress) {
      progress = manager.create(PlayerProgress, {
        userId,
        level: 1,
        xp: 0,
        stats: {},
        skills: {},
        achievements: {},
      });
    }

    const finalAmount = Math.floor(amount * multiplier);
    const previousLevel = progress.level;

    progress.xp = Number(progress.xp) + finalAmount;

    const newLevel = Math.floor(Math.sqrt(Number(progress.xp) / 100)) + 1;

    let leveledUp = false;
    if (newLevel > progress.level) {
      this.logger.log(`User ${userId} leveled up to ${newLevel}!`);
      progress.level = newLevel;
      leveledUp = true;
    }

    const savedProgress = await manager.save(progress);

    // Award coins for XP gained (1 coin per 10 XP)
    const coinsAwarded = Math.floor(finalAmount / 10);
    if (coinsAwarded > 0) {
      await this.economyService.addCurrency(
        userId,
        CurrencyType.COINS,
        coinsAwarded,
        `XP reward: ${finalAmount} XP gained`,
        TransactionType.REWARD,
        { xpGained: finalAmount },
        `xp_reward:${userId}:${savedProgress.xp}`,
        undefined,
        manager,
      );
    }

    // Award bonus gems on level up (5 gems per level)
    if (leveledUp) {
      const levelsGained = newLevel - previousLevel;
      const gemsAwarded = levelsGained * 5;
      await this.economyService.addCurrency(
        userId,
        CurrencyType.GEMS,
        gemsAwarded,
        `Level up bonus: Level ${newLevel}`,
        TransactionType.REWARD,
        { newLevel, previousLevel },
        `level_up:${userId}:${newLevel}`,
        undefined,
        manager,
      );
    }

    // PERF: Invalidate cached progress after any XP grant so subsequent reads are fresh.
    this.cache.invalidate(progressCacheKey(userId));
    return savedProgress;
  }

  async modifyStat(userId: number, statKey: string, value: any): Promise<PlayerProgress> {
    // PERF: Use a transaction to prevent race condition if two stats update simultaneously.
    const result = await this.dataSource.transaction(async (manager: EntityManager) => {
      const progress = await manager.findOne(PlayerProgress, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!progress) throw new NotFoundException(`Progress not found for user ${userId}`);
      progress.stats = { ...(progress.stats || {}), [statKey]: value };
      return manager.save(progress);
    });

    // PERF: Invalidate cache after write.
    this.cache.invalidate(progressCacheKey(userId));
    return result;
  }

  async unlockAchievement(userId: number, achievementKey: string): Promise<PlayerProgress> {
    // PERF: Use a transaction to prevent race condition on achievement unlock.
    const result = await this.dataSource.transaction(async (manager: EntityManager) => {
      const progress = await manager.findOne(PlayerProgress, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!progress) throw new NotFoundException(`Progress not found for user ${userId}`);
      progress.achievements = {
        ...(progress.achievements || {}),
        [achievementKey]: { unlockedAt: new Date().toISOString() },
      };
      return manager.save(progress);
    });

    // PERF: Invalidate cache after write.
    this.cache.invalidate(progressCacheKey(userId));
    return result;
  }

  async applyGlobalModifier(modifier: { type: string, value: any }): Promise<void> {
    // This could be stored in a cache or used to broadcast to all players
    this.logger.log(`Applying global modifier: ${JSON.stringify(modifier)}`);
    // For now, we just log it, but in a real system we might update a global config or cache
  }
}
