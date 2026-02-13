import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSchoolSubjectDto } from './dto/create-school-subject.dto';
import { UpdateSchoolSubjectDto } from './dto/update-school-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchoolSubject } from './entities/school-subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchoolSubjectService {
  constructor(
    @InjectRepository(SchoolSubject) private readonly schoolSubjectRepo: Repository<SchoolSubject>
  ) { }

  async create(createSchoolSubjectDto: CreateSchoolSubjectDto) {
    const schoolSubject = this.schoolSubjectRepo.create(createSchoolSubjectDto)
    return await this.schoolSubjectRepo.save(schoolSubject)
  }

  async findAll() {
    return await this.schoolSubjectRepo.find()
  }

  async findOne(id: number) {
    const schoolSubject = await this.schoolSubjectRepo.findOne({ where: { id } })
    if (!schoolSubject) throw new NotFoundException('school subject not found')
    return schoolSubject
  }

  async update(id: number, updateSchoolSubjectDto: UpdateSchoolSubjectDto) {
    const schoolSubject = await this.findOne(id)
    const updatedSchoolSubject = this.schoolSubjectRepo.merge(schoolSubject, updateSchoolSubjectDto)
    return await this.schoolSubjectRepo.save(updatedSchoolSubject)
  }

  async remove(id: number) {
    const schoolSubject = await this.findOne(id)
    await this.schoolSubjectRepo.remove(schoolSubject)
    return { message: 'school subject deleted successfully' }
  }
}
