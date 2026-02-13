import { Module } from '@nestjs/common';
import { SchoolSubjectService } from './school-subject.service';
import { SchoolSubjectController } from './school-subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolSubject } from './entities/school-subject.entity';

@Module({
  controllers: [SchoolSubjectController],
  providers: [SchoolSubjectService],
  imports: [TypeOrmModule.forFeature([SchoolSubject])]
})
export class SchoolSubjectModule { }
