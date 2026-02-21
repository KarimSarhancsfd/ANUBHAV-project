import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnswerDto } from './dto/answer.dto';

@ApiTags('Match Engine (Legacy Quiz)')
@ApiBearerAuth()
@Controller('api/quiz')
// @UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post()
  @ApiOperation({ summary: 'Initialize a new Match Session' })
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @Req() req: Response
  ): Promise<Quiz> {    
    return this.quizService.createQuiz(createQuizDto, req['user']);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all available Match Sessions/Game Modes' })
  async findAll(): Promise<Quiz[]> {
    return this.quizService.findAllQuizzes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific Session/Match' })
  async findOne(@Param('id') id: string): Promise<Quiz | string> {
    return this.quizService.findQuizById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Session configuration' })
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto): Promise<Quiz | string> {
    return this.quizService.updateQuiz(+id, updateQuizDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a Session mode' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.quizService.removeQuiz(id);
  }

  @Post('submitAnswer/:quizId')
  @ApiOperation({ summary: 'Submit results for a completed Match Session' })
  async submitMatchAnswer(
    @Param('quizId') quizId: number,
    @Body() answers: AnswerDto[],
    @Req() req: any,
  ) {
    // SECURITY: Ensure userId is taken from authenticated context
    const userId = req.user?.userId || req['user']?.userId;
    return this.quizService.submitQuizAnswers(quizId, answers, userId);
  }
}
