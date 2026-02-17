import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProgress } from './entities/player-progress.entity';
import { EconomyService } from '../economy/economy.service';
import { CurrencyType } from '../economy/enums/economy.enums';

@Injectable()
export class PlayerProgressService {
  private readonly logger = new Logger(PlayerProgressService.name);

  constructor(
    @InjectRepository(PlayerProgress)
    private readonly progressRepository: Repository<PlayerProgress>,
    private readonly economyService: EconomyService,
  ) {}

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
    const progress = await this.getProgress(userId);
    const finalAmount = Math.floor(amount * multiplier);
    const previousLevel = progress.level;
    
    progress.xp = Number(progress.xp) + finalAmount;
    
    // Simple level up logic: level = floor(sqrt(xp/100)) + 1
    const newLevel = Math.floor(Math.sqrt(Number(progress.xp) / 100)) + 1;
    
    let leveledUp = false;
    if (newLevel > progress.level) {
      this.logger.log(`User ${userId} leveled up to ${newLevel}!`);
      progress.level = newLevel;
      leveledUp = true;
    }

    const savedProgress = await this.progressRepository.save(progress);

    // Award coins for XP gained (1 coin per 10 XP)
    const coinsAwarded = Math.floor(finalAmount / 10);
    if (coinsAwarded > 0) {
      try {
        await this.economyService.addCurrency(
          userId,
          CurrencyType.COINS,
          coinsAwarded,
          `XP reward: ${finalAmount} XP gained`,
          undefined,
          { xpGained: finalAmount },
        );
        this.logger.log(`Awarded ${coinsAwarded} coins to user ${userId} for XP gain`);
      } catch (error) {
        this.logger.error(`Failed to award coins for XP: ${error.message}`);
      }
    }

    // Award bonus gems on level up (5 gems per level)
    if (leveledUp) {
      const levelsGained = newLevel - previousLevel;
      const gemsAwarded = levelsGained * 5;
      try {
        await this.economyService.addCurrency(
          userId,
          CurrencyType.GEMS,
          gemsAwarded,
          `Level up bonus: Level ${newLevel}`,
          undefined,
          { newLevel, previousLevel },
        );
        this.logger.log(`Awarded ${gemsAwarded} gems to user ${userId} for leveling up to ${newLevel}`);
      } catch (error) {
        this.logger.error(`Failed to award gems for level up: ${error.message}`);
      }
    }

    return savedProgress;
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
