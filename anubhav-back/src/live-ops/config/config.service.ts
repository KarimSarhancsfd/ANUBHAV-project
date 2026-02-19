import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoteConfig, ConfigType } from './entities/remote-config.entity';
import { AppCacheService } from '../../common/cache/app-cache.service';

/** PERF: Cache TTL for remote config values — 60 seconds. */
const CONFIG_CACHE_TTL_MS = 60_000;

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(RemoteConfig)
    private readonly configRepository: Repository<RemoteConfig>,
    // PERF: AppCacheService injected globally via CommonModule.
    // Config values are read very frequently (per-user in XP batch loops)
    // but change rarely — a 60s in-memory cache eliminates most DB hits.
    private readonly cache: AppCacheService,
  ) {}

  private cacheKey(key: string) {
    return `config:${key}`;
  }

  async getAllConfigs(): Promise<RemoteConfig[]> {
    // PERF: Not cached — admin-facing, expected to be infrequent.
    return this.configRepository.find({
      order: { key: 'ASC' },
    });
  }

  async getConfig(key: string): Promise<RemoteConfig> {
    // PERF: Cache config entities for 60s. Most config keys are read-heavy
    // and write-rare (e.g. progression.xp_multiplier rarely changes).
    return this.cache.getOrSet(
      this.cacheKey(key),
      async () => {
        const config = await this.configRepository.findOne({ where: { key } });
        if (!config) {
          throw new NotFoundException(`Config with key ${key} not found`);
        }
        return config;
      },
      CONFIG_CACHE_TTL_MS,
    );
  }

  async getConfigValue<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const config = await this.getConfig(key);
      return config.value as T;
    } catch {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new NotFoundException(`Config with key ${key} not found`);
    }
  }

  async setConfig(
    key: string,
    value: any,
    type: ConfigType = ConfigType.JSON,
  ): Promise<RemoteConfig> {
    let config = await this.configRepository.findOne({ where: { key } });

    if (config) {
      config.value = value;
      config.type = type;
      config.version += 1;
      config.updatedAt = new Date();
    } else {
      config = this.configRepository.create({
        key,
        value,
        type,
        version: 1,
      });
    }

    const saved = await this.configRepository.save(config);
    // PERF: Invalidate cache immediately after write so next read is fresh.
    this.cache.invalidate(this.cacheKey(key));
    return saved;
  }

  async updateConfig(key: string, value: any): Promise<RemoteConfig> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) throw new NotFoundException(`Config with key ${key} not found`);
    config.value = value;
    config.version += 1;
    config.updatedAt = new Date();
    const saved = await this.configRepository.save(config);
    // PERF: Invalidate stale cache on update.
    this.cache.invalidate(this.cacheKey(key));
    return saved;
  }

  async deleteConfig(key: string): Promise<void> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) throw new NotFoundException(`Config with key ${key} not found`);
    await this.configRepository.remove(config);
    // PERF: Invalidate stale cache on delete.
    this.cache.invalidate(this.cacheKey(key));
  }

  async getConfigCount(): Promise<number> {
    // PERF: Cache count for 10s — used in system status which is polled frequently.
    return this.cache.getOrSet(
      'config:__count',
      () => this.configRepository.count(),
      10_000,
    );
  }

  async getFeatureFlag(key: string, defaultValue = false): Promise<boolean> {
    try {
      const config = await this.getConfig(key);
      if (config.type === ConfigType.FLAG) {
        return config.value as boolean;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async setFeatureFlag(key: string, value: boolean): Promise<RemoteConfig> {
    return this.setConfig(key, value, ConfigType.FLAG);
  }
}


