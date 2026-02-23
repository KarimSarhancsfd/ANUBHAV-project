/**
 * @file groups.module.ts
 * @description NestJS module for grouping related controllers and services
 */
import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';

/**
 * NestJS module that consolidates group-related controllers, services, and TypeORM configurations
 */
@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
