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
export class MatchSessionsController {
  constructor(private readonly matchSessionsService: MatchSessionsService) {}

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
  @Post('/quiz-legacy')
  @ApiOperation({ summary: 'Legacy route for creating a quiz' })
  async createLegacy(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Response,
  ): Promise<MatchSession> {
    return this.create(createSessionDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all available Match Sessions/Game Modes' })
  async findAll(): Promise<MatchSession[]> {
    return this.matchSessionsService.findAllSessions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific Session/Match' })
  async findOne(@Param('id') id: string): Promise<MatchSession | string> {
    return this.matchSessionsService.findSessionById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Session configuration' })
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<MatchSession | string> {
    return this.matchSessionsService.updateSession(+id, updateSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a Session mode' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.matchSessionsService.removeSession(id);
  }

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
