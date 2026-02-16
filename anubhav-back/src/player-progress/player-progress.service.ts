import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProgress } from './entities/player-progress.entity';

@Injectable()
export class PlayerProgressService {
  private readonly logger = new Logger(PlayerProgressService.name);

  constructor(
    @InjectRepository(PlayerProgress)
    private readonly progressRepository: Repository<PlayerProgress>,
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
    
    progress.xp = Number(progress.xp) + finalAmount;
    
    // Simple level up logic: level = floor(sqrt(xp/100)) + 1
    const newLevel = Math.floor(Math.sqrt(Number(progress.xp) / 100)) + 1;
    
    if (newLevel > progress.level) {
      this.logger.log(`User ${userId} leveled up to ${newLevel}!`);
      progress.level = newLevel;
    }

    return await this.progressRepository.save(progress);
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
