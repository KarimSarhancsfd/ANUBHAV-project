/**
 * @file challenge-units.service.ts
 * @description Service for managing challenge units business logic
 */
import {
  ErrorStatusCodesEnum,
  Expose,
  SuccessStatusCodesEnum,
} from 'src/classes';
import { Injectable } from '@nestjs/common';
import { CreateChallengeUnitDto } from './dto/create-challenge-unit.dto';
import { UpdateChallengeUnitDto } from './dto/update-challenge-unit.dto';
import { In, Repository } from 'typeorm';
import { ChallengeUnit } from './entities/challenge-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubmitQuestionsDto } from './dto/submit_challenge_unit.dto';

/**
 * @description Service for handling challenge unit operations
 */
@Injectable()
export class ChallengeUnitsService {
  /**
   * @description Creates an instance of ChallengeUnitsService
   * @param {Repository<ChallengeUnit>} questionRepo - TypeORM repository for ChallengeUnit entity
   * @param {Expose} response - Utility for standardized API responses
   */
  constructor(
    @InjectRepository(ChallengeUnit)
    private readonly questionRepo: Repository<ChallengeUnit>,
    private readonly response: Expose,
  ) {}

  /**
   * @description Creates a new challenge unit
   * @param {CreateChallengeUnitDto & { quiz_id?: any }} createQuestionDto - DTO containing challenge unit data
   * @returns {Promise<any>} Success response with created challenge unit or error response
   */
  async create(createQuestionDto: CreateChallengeUnitDto & { quiz_id?: any }) {
    try {
      const question = this.questionRepo.create(createQuestionDto as any);
      const result = await this.questionRepo.save(question);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'challenge unit created successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  /**
   * @description Retrieves all challenge units with their associated quiz
   * @returns {Promise<any>} Success response with array of challenge units or error response
   */
  async findAll() {
    try {
      const result = await this.questionRepo.find({
        relations: { quiz_id: true },
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'challenge units fetched successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  /**
   * @description Retrieves a single challenge unit by ID
   * @param {number} id - ID of the challenge unit
   * @returns {Promise<any>} Success response with challenge unit or error response if not found
   */
  async findOne(id: number) {
    try {
      const question = await this.questionRepo.findOne({ where: { id } });
      if (!question)
        return this.response.error(
          ErrorStatusCodesEnum.BadRequest,
          'challenge unit not found',
        );
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'challenge unit fetched successfully',
        question,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  /**
   * @description Submits user answers for a challenge unit quiz
   * @param {SubmitQuestionsDto} submitQuestionsDto - DTO containing submitted answers
   * @param {number} quizId - ID of the quiz
   * @returns {Promise<any>} Success response or error response if validation fails
   */
  async submitAnswer(submitQuestionsDto: SubmitQuestionsDto, quizId: number) {
    try {
      const { questions } = submitQuestionsDto;

      const questionsIds = questions.map((q) => q.question_id);
      const existingQuestions = await this.questionRepo.find({
        where: {
          id: In(questionsIds as any),
          quiz_id: { id: quizId },
        },
      });

      if (existingQuestions.length !== questions.length) {
        return this.response.error(
          ErrorStatusCodesEnum.BadRequest,
          'There is a certain challenge lost...!',
        );
      }

      const updateQuestions = existingQuestions.map((question) => {
        const updateAnswers = questions.find(
          (q) => +q.question_id === +question.id,
        );
        if (updateAnswers) {
          question.user_answer_index = updateAnswers.user_answer_index;
          question.user_answer = updateAnswers.user_answer;
        }
        return question;
      });
      await this.questionRepo.save(updateQuestions);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'Match challenges have been updated successfully',
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        `${error.message}`,
      );
    }
  }

  /**
   * @description Updates an existing challenge unit
   * @param {number} id - ID of the challenge unit to update
   * @param {UpdateChallengeUnitDto} updateQuestionDto - DTO containing update data
   * @returns {Promise<any>} Success response with updated challenge unit or error response
   */
  async update(id: number, updateQuestionDto: UpdateChallengeUnitDto) {
    try {
      const challengeUnit = await this.findOne(id);
      const updateData = this.questionRepo.merge(
        challengeUnit.data,
        updateQuestionDto as any,
      );
      const result = await this.questionRepo.save(updateData);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'challenge unit updated successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  /**
   * @description Deletes a challenge unit by ID
   * @param {number} id - ID of the challenge unit to delete
   * @returns {Promise<any>} Success notification or error response
   */
  async remove(id: number) {
    try {
      const challengeUnit = await this.findOne(id);
      await this.questionRepo.remove(challengeUnit.data);
      return this.response.notify(
        SuccessStatusCodesEnum.Ok,
        'challenge unit removed successfully',
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }
}
