/**
 * @file UserActivities Module
 * @description NestJS module for user activities feature
 */
import { Module } from '@nestjs/common';
import { UserActivitiesService } from './useractivities.service';
import {UserActivitiesController} from './useractivities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivities} from './entities/useractivities.entity';

/**
 * @class UseractivitiesModule
 * @description NestJS module that bundles user activities related components
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserActivities])],
  controllers: [UserActivitiesController],
  providers: [UserActivitiesService ],
})
export class UseractivitiesModule {}
