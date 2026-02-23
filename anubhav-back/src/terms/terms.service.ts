/**
 * @file Terms service for business logic related to terms and policies
 * @description Service layer handling data operations for terms and policies
 */
import { Injectable } from '@nestjs/common';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';
import { Repository } from 'typeorm';

@Injectable()

/**
 * Service for managing terms and policies business logic
 */
export class TermsService {
  constructor(
    @InjectRepository(Term)
    private termRepository: Repository<Term>,
  ) {}

  /**
   * Creates a new term/policy entry in the database
   * @param createTermDto - Data transfer object containing term/policy details
   * @returns Created term/policy entity
   */
  async create(createTermDto: CreateTermDto) {
    return await this.termRepository.save(createTermDto);
  }

  /**
   * Retrieves all terms/policies from the database
   * @returns Array of all term/policy entities
   */
  async findAll() {
    return await this.termRepository.find();
  }

  /**
   * Retrieves a single term/policy by ID
   * @param id - The ID of the term/policy to retrieve
   * @returns The term/policy entity if found, null otherwise
   */
  async findOne(id: number) {
    return await this.termRepository.findOneBy({ id });
  }

  /**
   * Updates an existing term/policy
   * @param id - The ID of the term/policy to update
   * @param updateTermDto - Data transfer object containing updated details
   * @returns Update result
   */
  async update(id: number, updateTermDto: UpdateTermDto) {
    return await this.termRepository.update(id, updateTermDto);
  }

  /**
   * Soft deletes a term/policy by ID
   * @param id - The ID of the term/policy to delete
   * @returns Delete result
   */
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
