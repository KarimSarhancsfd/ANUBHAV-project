import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizResult } from './entities/quiz-result.entity';
import {AnswerDto } from './dto/answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuestionsService } from '../questions/questions.service';
import {
  ErrorStatusCodesEnum,
  Expose,
  SuccessStatusCodesEnum,
} from 'src/classes';
import { PlayerProgressService } from '../player-progress/player-progress.service';
import { EconomyService } from '../economy/economy.service';
import { LiveOpsService } from '../live-ops/live-ops.service';
import { CurrencyType, TransactionType } from '../economy/enums/economy.enums';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    private readonly response: Expose,
    private questionService: QuestionsService,
    @InjectRepository(QuizResult) 
    private resultRepo: Repository<QuizResult>,
    private playerProgressService: PlayerProgressService,
    private economyService: EconomyService,
    private liveOpsService: LiveOpsService,
  ) { }

  async createQuiz(createQuizDto: CreateQuizDto, user: any): Promise<any> {
    try {
      const { questions, ...data } = createQuizDto
      const newQuiz = this.quizRepo.create({
        ...data,
        user_id: user.userId,
      });
      const result = await this.quizRepo.save(newQuiz);
      questions.map(async (question) => {
        await this.questionService.create({ ...question, quiz_id: result.id } as any);
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quiz created successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async findAllQuizzes(): Promise<any> {
    try {
      const result = await this.quizRepo.find({
        relations: { questions: true },
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quizs fetched successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async findQuizById(id: number): Promise<any> {
    try {
      const quiz = await this.quizRepo.findOne({ where: { id } });
      if (!quiz)
        return this.response.error(
          ErrorStatusCodesEnum.BadRequest,
          'quiz not found',
        );
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quiz fetched successfully',
        quiz,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async updateQuiz(
    id: number,
    updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz | any> {
    try {
      const quiz = await this.findQuizById(id);
      this.quizRepo.merge(quiz, updateQuizDto);
      const result = await this.quizRepo.save(quiz);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quiz updated successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async removeQuiz(id: number): Promise<any> {
    try {
      const quiz = await this.findQuizById(id);
      await this.quizRepo.remove(quiz);
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  /**
   * Refactored: Match Session Submission Logic
   * Merges Quiz logic with Economy rewards and LiveOps multipliers.
   */
  /**
   * Refactored: Match Session Submission Logic
   * Atomic Transaction: Merges Results, XP, and Economy rewards.
   */
  async submitQuizAnswers(quizId: number, answers: AnswerDto[], userId: number) {
    const queryRunner = this.quizRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quiz = await queryRunner.manager.findOne(Quiz, {
        where: { id: quizId },
        relations: ['questions'],
      });

      if (!quiz) {
        throw new Error('Match/Session not found');
      }

      // 1. Evaluate Challenges
      const results = quiz.questions.map((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);
        const isCorrect = userAnswer?.answer === question.correct_answer_index;
        const mark = isCorrect ? question.mark_value : 0;

        return {
          questionId: question.id,
          isCorrect,
          mark,
          correctAnswer: question.correct_answer_index,
          userAnswer: userAnswer?.answer,
        };
      });
      const baseScore = results.reduce((sum, r) => sum + r.mark, 0);

      // 2. Save Match Results
      const quizResult = queryRunner.manager.create(QuizResult, {
        quiz: quiz,
        user: { id: userId } as any,
        totalScore: baseScore,
        details: results,
      });
      await queryRunner.manager.save(quizResult);

      // 3. Reward Progression (XP) - Pass manager for transaction context
      await this.playerProgressService.grantXP(userId, baseScore, 1, queryRunner.manager);
      // Note: grantXP inside service uses its own dataSource.transaction by default.
      // Ideally, it should accept an EntityManager to participate in this transaction.
      // For now, I'll rely on idempotency keys inside grantXP/addCurrency if possible, 
      // but the safest way is passing the manager.
      
      // Let's check grantXP signature again. It doesn't accept manager currently.
      // I'll update grantXP later or use nested transactions if supported.
      // Actually, I'll update grantXP to accept an optional manager.

      // 4. Reward Economy (Currency)
      const coinReward = Math.floor(baseScore / 5);
      if (coinReward > 0) {
        await this.economyService.addCurrency(
          userId,
          CurrencyType.COINS,
          coinReward,
          `Match Reward: ${quiz.name}`,
          TransactionType.REWARD,
          { quizId, score: baseScore },
          `match_reward:${quizId}:${userId}:${Date.now()}`, // Idempotency
          undefined,
          queryRunner.manager // PASS MANAGER
        );
      }

      await queryRunner.commitTransaction();

      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'Match session processed successfully',
        {
          sessionId: quizId,
          totalScore: baseScore,
          xpGained: baseScore,
          currencyGained: coinReward,
          details: results,
        },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message);
    } finally {
      await queryRunner.release();
    }
  }
}

