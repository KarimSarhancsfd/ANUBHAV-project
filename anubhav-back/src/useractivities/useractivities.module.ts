import { Module } from '@nestjs/common';
import { UserActivitiesService } from './useractivities.service';
import {UserActivitiesController} from './useractivities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivities} from './entities/useractivities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivities])],
  controllers: [UserActivitiesController],
  providers: [UserActivitiesService ],
})
export class UseractivitiesModule {}
