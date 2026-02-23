/**
 * @file Config Service
 * @description Service for managing remote configuration with caching support.
 * Provides methods to get, set, update, and delete configuration values.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoteConfig, ConfigType } from './entities/remote-config.entity';
import { AppCacheService } from '../../common/cache/app-cache.service';

/** PERF: Cache TTL for remote config values — 60 seconds. */
const CONFIG_CACHE_TTL_MS = 60_000;

/**
 * @class ConfigService
 * @description Service for managing remote configuration with in-memory caching.
 */
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

  /**
   * @method cacheKey
   * @description Generates a cache key for a configuration entry.
   * @param {string} key - The configuration key.
   * @returns {string} The formatted cache key.
   * @private
   */
  private cacheKey(key: string) {
    return `config:${key}`;
  }

  /**
   * @method getAllConfigs
   * @description Retrieves all remote configurations sorted by key.
   * @returns {Promise<Array>} Array of all configuration objects.
   */
  async getAllConfigs(): Promise<RemoteConfig[]> {
    // PERF: Not cached — admin-facing, expected to be infrequent.
    return this.configRepository.find({
      order: { key: 'ASC' },
    });
  }

  /**
   * @method getConfig
   * @description Retrieves a specific configuration by key with caching.
   * @param {string} key - The configuration key to retrieve.
   * @returns {Promise<Object>} The configuration object.
   * @throws {NotFoundException} If the configuration is not found.
   */
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

  /**
   * @method getConfigValue
   * @description Retrieves the value of a configuration by key with optional default value.
   * @param {string} key - The configuration key.
   * @param {T} [defaultValue] - Default value to return if config is not found.
   * @returns {Promise<T>} The configuration value or default.
   */
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

  /**
   * @method setConfig
   * @description Creates or updates a configuration entry.
   * @param {string} key - The configuration key.
   * @param {any} value - The configuration value.
   * @param {ConfigType} [type=ConfigType.JSON] - The type of the configuration.
   * @returns {Promise<Object>} The saved configuration object.
   */
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

  /**
   * @method updateConfig
   * @description Updates only the value of an existing configuration.
   * @param {string} key - The configuration key.
   * @param {any} value - The new configuration value.
   * @returns {Promise<Object>} The saved configuration object.
   * @throws {NotFoundException} If the configuration is not found.
   */
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

  /**
   * @method deleteConfig
   * @description Deletes a configuration by key.
   * @param {string} key - The configuration key to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the configuration is not found.
   */
  async deleteConfig(key: string): Promise<void> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) throw new NotFoundException(`Config with key ${key} not found`);
    await this.configRepository.remove(config);
    // PERF: Invalidate stale cache on delete.
    this.cache.invalidate(this.cacheKey(key));
  }

  /**
   * @method getConfigCount
   * @description Retrieves the total count of configurations. Cached for 10 seconds.
   * @returns {Promise<number>} The total number of configuration entries.
   */
  async getConfigCount(): Promise<number> {
    // PERF: Cache count for 10s — used in system status which is polled frequently.
    return this.cache.getOrSet(
      'config:__count',
      () => this.configRepository.count(),
      10_000,
    );
  }

  /**
   * @method getFeatureFlag
   * @description Retrieves a boolean feature flag configuration.
   * @param {string} key - The feature flag key.
   * @param {boolean} [defaultValue=false] - Default value if flag is not found.
   * @returns {Promise<boolean>} The feature flag value.
   */
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

  /**
   * @method setFeatureFlag
   * @description Sets a boolean feature flag configuration.
   * @param {string} key - The feature flag key.
   * @param {boolean} value - The feature flag value.
   * @returns {Promise<Object>} The saved configuration object.
   */
  async setFeatureFlag(key: string, value: boolean): Promise<RemoteConfig> {
    return this.setConfig(key, value, ConfigType.FLAG);
  }
}


