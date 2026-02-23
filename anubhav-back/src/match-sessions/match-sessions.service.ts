/**
 * @file Match Sessions Service
 * @description Business logic layer for managing match sessions. Handles session CRUD operations,
 * answer evaluation, scoring calculation, XP rewards, and economy rewards for completed match sessions.
 */
import { Injectable } from '@nestjs/common';
import { CreateMatchSessionDto as CreateSessionDto } from './dto/create-match-session.dto';
import { UpdateMatchSessionDto as UpdateSessionDto } from './dto/update-match-session.dto';
import { MatchResult } from './entities/match-result.entity';
import { AnswerDto } from './dto/answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchSession } from './entities/match-session.entity';
import { ChallengeUnitsService } from '../challenge-units/challenge-units.service';
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

/**
 * Match Sessions Service
 * Core service handling match session business logic including CRUD operations, answer evaluation,
 * score calculation, and reward distribution (XP and currency) upon session completion.
 */
export class MatchSessionsService {
  constructor(
    @InjectRepository(MatchSession)
    private sessionRepo: Repository<MatchSession>,
    private readonly response: Expose,
    private challengeUnitsService: ChallengeUnitsService,
    @InjectRepository(MatchResult)
    private resultRepo: Repository<MatchResult>,
    private playerProgressService: PlayerProgressService,
    private economyService: EconomyService,
    private liveOpsService: LiveOpsService,
  ) {}

  /**
   * Creates a new match session and optionally associates challenge questions with it.
   * @param createSessionDto - Data transfer object containing session details (name, difficulty, questions).
   * @param user - Authenticated user object containing userId.
   * @returns Success response with created session data, or error response on failure.
   */
  async createSession(createSessionDto: CreateSessionDto, user: any): Promise<any> {
    try {
      const { questions, ...data } = createSessionDto;
      const newSession = this.sessionRepo.create({
        ...data,
        user_id: user.userId,
      });
      const result = await this.sessionRepo.save(newSession);
      if (questions) {
        questions.map(async (question) => {
          await this.challengeUnitsService.create({
            ...question,
            quiz_id: result.id,
          } as any);
        });
      }
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'match session created successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  /**
   * Retrieves all match sessions from the database with their associated questions.
   * @returns Success response with array of all match sessions, or error response on failure.
   */
  async findAllSessions(): Promise<any> {
    try {
      const result = await this.sessionRepo.find({
        relations: { questions: true },
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'match sessions fetched successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  /**
   * Retrieves a single match session by its unique identifier.
   * @param id - The unique identifier of the match session.
   * @returns Success response with the match session data, or error response if not found.
   */
  async findSessionById(id: number): Promise<any> {
    try {
      const session = await this.sessionRepo.findOne({ where: { id } });
      if (!session)
        return this.response.error(
          ErrorStatusCodesEnum.BadRequest,
          'match session not found',
        );
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'match session fetched successfully',
        session,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  /**
   * Updates an existing match session with new configuration data.
   * @param id - The unique identifier of the match session to update.
   * @param updateSessionDto - Data transfer object containing fields to update.
   * @returns Success response with updated session data, or error response on failure.
   */
  async updateSession(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<MatchSession | any> {
    try {
      const session = await this.findSessionById(id);
      this.sessionRepo.merge(session.data, updateSessionDto);
      const result = await this.sessionRepo.save(session.data);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'match session updated successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  /**
   * Removes a match session from the database.
   * @param id - The unique identifier of the match session to remove.
   * @returns Success notification upon deletion, or error response on failure.
   */
  async removeSession(id: number): Promise<any> {
    try {
      const session = await this.findSessionById(id);
      await this.sessionRepo.remove(session.data);
      return this.response.notify(
        SuccessStatusCodesEnum.Ok,
        'match session removed successfully',
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  /**
   * Evaluates user answers, calculates score, grants XP and currency rewards, and persists match results.
   * Uses database transaction to ensure data consistency across all operations.
   * @param sessionId - The unique identifier of the completed match session.
   * @param answers - Array of AnswerDto objects containing user's selected answers for each question.
   * @param userId - The unique identifier of the user submitting the results.
   * @returns Success response with score, XP gained, currency rewards, and detailed results, or error response on failure.
   */
  async submitSessionResults(
    sessionId: number,
    answers: AnswerDto[],
    userId: number,
  ) {
    const queryRunner = this.sessionRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const session = await queryRunner.manager.findOne(MatchSession, {
        where: { id: sessionId },
        relations: ['questions'],
      });

      if (!session) {
        throw new Error('Match session not found');
      }

      // 1. Evaluate Challenges
      const results = session.questions.map((question) => {
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
      const matchResult = queryRunner.manager.create(MatchResult, {
        quiz: session,
        user: { id: userId } as any,
        totalScore: baseScore,
        details: results,
      });
      await queryRunner.manager.save(matchResult);

      // 3. Reward Progression (XP)
      await this.playerProgressService.grantXP(
        userId,
        baseScore,
        1,
        queryRunner.manager,
      );

      // 4. Reward Economy (Currency)
      const coinReward = Math.floor(baseScore / 5);
      if (coinReward > 0) {
        await this.economyService.addCurrency(
          userId,
          CurrencyType.COINS,
          coinReward,
          `Match Reward: ${session.name}`,
          TransactionType.REWARD,
          { sessionId, score: baseScore },
          `match_reward:${sessionId}:${userId}:${Date.now()}`,
          undefined,
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();

      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'Match session processed successfully',
        {
          sessionId,
          totalScore: baseScore,
          xpGained: baseScore,
          currencyGained: coinReward,
          details: results,
        },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
