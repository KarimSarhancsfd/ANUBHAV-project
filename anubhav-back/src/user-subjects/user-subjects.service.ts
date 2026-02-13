import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserSubjectDto } from './dto/create-user-subject.dto';
import { UpdateUserSubjectDto } from './dto/update-user-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSubject } from './entities/user-subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserSubjectsService {
  constructor(
    @InjectRepository(UserSubject) private readonly userSubjectRepo: Repository<UserSubject>
  ) { }

  async create(createUserSubjectDto: CreateUserSubjectDto) {
    const userSubject = this.userSubjectRepo.create(createUserSubjectDto)
    return await this.userSubjectRepo.save(userSubject)
  }

  async findAll() {
    await this.userSubjectRepo.find()
  }

  async findOne(id: number) {
    const userSubject = await this.userSubjectRepo.findOne({ where: { id } })
    if (!userSubject) throw new NotFoundException('user subject not found')
    return userSubject
  }

  async update(id: number, updateUserSubjectDto: UpdateUserSubjectDto) {
    const userSubject = await this.findOne(id)
    const updatedUserSubject = this.userSubjectRepo.merge(userSubject, updateUserSubjectDto)
    await this.userSubjectRepo.save(updatedUserSubject)
  }

  async remove(id: number) {
    const userSubject = await this.findOne(id)
    await this.userSubjectRepo.remove(userSubject)
    return { message: 'user subject deleted successfully' }
  }
}
