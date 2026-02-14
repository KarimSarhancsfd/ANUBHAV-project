import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoteConfig, ConfigType } from './entities/remote-config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(RemoteConfig)
    private readonly configRepository: Repository<RemoteConfig>,
  ) {}

  async getAllConfigs(): Promise<RemoteConfig[]> {
    return this.configRepository.find({
      order: { key: 'ASC' },
    });
  }

  async getConfig(key: string): Promise<RemoteConfig> {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Config with key ${key} not found`);
    }
    return config;
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

    return this.configRepository.save(config);
  }

  async updateConfig(key: string, value: any): Promise<RemoteConfig> {
    const config = await this.getConfig(key);
    config.value = value;
    config.version += 1;
    config.updatedAt = new Date();
    return this.configRepository.save(config);
  }

  async deleteConfig(key: string): Promise<void> {
    const config = await this.getConfig(key);
    await this.configRepository.remove(config);
  }

  async getConfigCount(): Promise<number> {
    return this.configRepository.count();
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
