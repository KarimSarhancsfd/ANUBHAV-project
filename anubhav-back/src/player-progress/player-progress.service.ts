import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { EconomyService } from '../economy/economy.service';
import { CurrencyType, TransactionType } from '../economy/enums/economy.enums';
import { LiveOpsService } from '../live-ops/live-ops.service';

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
  ) {}

  async getDashboardData(userId: number) {
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
    let progress = await this.progressRepository.findOne({ where: { userId } });
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
    return progress;
  }

  async grantXP(userId: number, amount: number, multiplier: number = 1): Promise<PlayerProgress> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      let progress = await manager.findOne(PlayerProgress, { 
        where: { userId },
        lock: { mode: 'pessimistic_write' }
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
          `xp_reward:${userId}:${savedProgress.xp}`, // Idempotency key based on new XP total
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
          `level_up:${userId}:${newLevel}`, // Idempotency key
          undefined,
          manager,
        );
      }

      return savedProgress;
    });
  }

  async modifyStat(userId: number, statKey: string, value: any): Promise<PlayerProgress> {
    const progress = await this.getProgress(userId);
    progress.stats = {
      ...(progress.stats || {}),
      [statKey]: value,
    };
    return await this.progressRepository.save(progress);
  }

  async unlockAchievement(userId: number, achievementKey: string): Promise<PlayerProgress> {
    const progress = await this.getProgress(userId);
    progress.achievements = {
      ...(progress.achievements || {}),
      [achievementKey]: {
        unlockedAt: new Date().toISOString(),
      },
    };
    return await this.progressRepository.save(progress);
  }

  async applyGlobalModifier(modifier: { type: string, value: any }): Promise<void> {
    // This could be stored in a cache or used to broadcast to all players
    this.logger.log(`Applying global modifier: ${JSON.stringify(modifier)}`);
    // For now, we just log it, but in a real system we might update a global config or cache
  }
}
