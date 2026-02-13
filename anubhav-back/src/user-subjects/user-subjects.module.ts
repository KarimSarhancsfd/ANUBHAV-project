import { Module } from '@nestjs/common';
import { UserSubjectsService } from './user-subjects.service';
import { UserSubjectsController } from './user-subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubject } from './entities/user-subject.entity';

@Module({
  controllers: [UserSubjectsController],
  providers: [UserSubjectsService],
  imports: [TypeOrmModule.forFeature([UserSubject])]
})
export class UserSubjectsModule { }
