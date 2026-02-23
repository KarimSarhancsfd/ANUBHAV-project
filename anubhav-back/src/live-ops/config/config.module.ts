/**
 * @file Config Module
 * @description NestJS module for managing remote configuration functionality.
 * Provides configuration CRUD operations with caching support.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { RemoteConfig } from './entities/remote-config.entity';

/**
 * @class ConfigModule
 * @description Module for handling remote configuration with TypeORM integration.
 */
@Module({
  imports: [TypeOrmModule.forFeature([RemoteConfig])],
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class ConfigModule {}
