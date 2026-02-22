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

@Injectable()
export class ChallengeUnitsService {
  constructor(
    @InjectRepository(ChallengeUnit)
    private readonly questionRepo: Repository<ChallengeUnit>,
    private readonly response: Expose,
  ) {}

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
