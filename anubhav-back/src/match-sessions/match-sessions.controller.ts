/**
 * @file Match Sessions Controller
 * @description RESTful API controller for managing match sessions (quiz games) in the Anubhav Gaming Studio platform.
 * Handles HTTP requests for creating, retrieving, updating, deleting match sessions, and submitting user answers.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { MatchSessionsService } from './match-sessions.service';
import { CreateMatchSessionDto as CreateSessionDto } from './dto/create-match-session.dto';
import { UpdateMatchSessionDto as UpdateSessionDto } from './dto/update-match-session.dto';
import { MatchSession } from './entities/match-session.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnswerDto } from './dto/answer.dto';

@ApiTags('Match Engine')
@ApiBearerAuth()
@Controller('api/match-sessions')
// @UseGuards(JwtAuthGuard)

/**
 * Match Sessions Controller
 * Provides REST endpoints for match session management including creation, retrieval, updates, deletion,
 * and result submission for the gaming platform's quiz/match system.
 */
export class MatchSessionsController {
  constructor(private readonly matchSessionsService: MatchSessionsService) {}

  /**
   * Creates a new match session for the authenticated user.
   * @param createSessionDto - Data transfer object containing session configuration (name, difficulty, questions).
   * @param req - Express request object containing authenticated user information.
   * @returns The created MatchSession object.
   */
  @Post()
  @ApiOperation({ summary: 'Initialize a new Match Session' })
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Response,
  ): Promise<MatchSession> {
    return this.matchSessionsService.createSession(
      createSessionDto,
      req['user'],
    );
  }

  /** @deprecated Maintain backward compatibility with quiz route */

  /**
   * Legacy endpoint for creating a quiz session. Maintains backward compatibility.
   * @param createSessionDto - Data transfer object containing session configuration.
   * @param req - Express request object containing authenticated user information.
   * @returns The created MatchSession object.
   */
  @Post('/quiz-legacy')
  @ApiOperation({ summary: 'Legacy route for creating a quiz' })
  async createLegacy(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Response,
  ): Promise<MatchSession> {
    return this.create(createSessionDto, req);
  }

  /**
   * Retrieves all available match sessions/game modes.
   * @returns Array of all MatchSession objects.
   */
  @Get()
  @ApiOperation({ summary: 'Fetch all available Match Sessions/Game Modes' })
  async findAll(): Promise<MatchSession[]> {
    return this.matchSessionsService.findAllSessions();
  }

  /**
   * Retrieves a specific match session by its ID.
   * @param id - The unique identifier of the match session.
   * @returns The MatchSession object if found, or an error message string.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific Session/Match' })
  async findOne(@Param('id') id: string): Promise<MatchSession | string> {
    return this.matchSessionsService.findSessionById(+id);
  }

  /**
   * Updates an existing match session configuration.
   * @param id - The unique identifier of the match session to update.
   * @param updateSessionDto - Data transfer object containing updated session fields.
   * @returns The updated MatchSession object if successful, or an error message string.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update Session configuration' })
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<MatchSession | string> {
    return this.matchSessionsService.updateSession(+id, updateSessionDto);
  }

  /**
   * Removes a match session from the system.
   * @param id - The unique identifier of the match session to delete.
   * @returns void upon successful deletion.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a Session mode' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.matchSessionsService.removeSession(id);
  }

  /**
   * Submits answers for a completed match session and calculates results.
   * @param sessionId - The unique identifier of the match session being submitted.
   * @param answers - Array of AnswerDto containing user's selected answers for each question.
   * @param req - Express request object containing authenticated user information.
   * @returns Object containing total score, XP gained, currency rewards, and detailed results.
   */
  @Post('submitResult/:sessionId')
  @ApiOperation({ summary: 'Submit results for a completed Match Session' })
  async submitMatchResult(
    @Param('sessionId') sessionId: number,
    @Body() answers: AnswerDto[],
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req['user']?.userId;
    return this.matchSessionsService.submitSessionResults(
      sessionId,
      answers,
      userId,
    );
  }

  /** @deprecated Legacy Result Submission */

  /**
   * Legacy endpoint for submitting match results. Maintains backward compatibility.
   * @param quizId - The unique identifier of the quiz (match session).
   * @param answers - Array of AnswerDto containing user's selected answers.
   * @param req - Express request object containing authenticated user information.
   * @returns Object containing total score, XP gained, currency rewards, and detailed results.
   */
  @Post('submitAnswer/:quizId')
  @ApiOperation({ summary: 'Legacy endpoint for result submission' })
  async submitMatchAnswerLegacy(
    @Param('quizId') quizId: number,
    @Body() answers: AnswerDto[],
    @Req() req: any,
  ) {
    return this.submitMatchResult(quizId, answers, req);
  }
}
