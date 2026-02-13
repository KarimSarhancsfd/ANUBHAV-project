import { Injectable } from '@nestjs/common';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TermsService {
  constructor(
    @InjectRepository(Term)
    private termRepository: Repository<Term>,
  ) {}

  async create(createTermDto: CreateTermDto) {
    return await this.termRepository.save(createTermDto);
  }

  async findAll() {
    return await this.termRepository.find();
  }

  async findOne(id: number) {
    return await this.termRepository.findOneBy({ id });
  }

  async update(id: number, updateTermDto: UpdateTermDto) {
    return await this.termRepository.update(id, updateTermDto);
  }

  async remove(id: number) {
    return await this.termRepository.softDelete(id);
  }

  // async findByType(termType: string) {
  //   return this.policyRepository.find({ where: { term: termType } });
  // }

  // async updateterm(termType: string) {
  //   return this.policyRepository.update;
  // }
}
