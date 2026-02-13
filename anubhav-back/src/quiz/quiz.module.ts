import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Expose } from 'src/classes';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/entities/question.entity';
import { QuizResult } from './entities/quiz-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, QuizResult])],
  controllers: [QuizController],
  providers: [QuizService, Expose, QuestionsService],
})
export class QuizModule {}
