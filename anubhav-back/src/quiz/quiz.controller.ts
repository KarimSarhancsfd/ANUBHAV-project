import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Response } from 'express';


@Controller('api/quiz')
// @UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post()
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @Req() req: Response
  ): Promise<Quiz> {    
    return this.quizService.createQuiz(createQuizDto, req['user']);
  }

  @Get()
  async findAll(): Promise<Quiz[]> {
    return this.quizService.findAllQuizzes();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Quiz | string> {
    return this.quizService.findQuizById(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto): Promise<Quiz | string> {
    return this.quizService.updateQuiz(+id, updateQuizDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.quizService.removeQuiz(id);
  }


}

