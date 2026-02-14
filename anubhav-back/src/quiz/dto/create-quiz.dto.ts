import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { QuizLevel, QuizQuestionsType } from '../entities/quiz.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Question } from 'src/questions/entities/question.entity';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'name', description: 'name' })
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 20, description: 'mark of quiz' })
  mark!: number;

  @IsEnum(QuizQuestionsType)
  @IsNotEmpty()
  @ApiProperty({ example: 'random', description: 'question_type' })
  question_type!: QuizQuestionsType;

  @IsEnum(QuizLevel)
  @IsNotEmpty()
  @ApiProperty({ example: 'medium', description: 'question_level' })
  question_level!: QuizLevel;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ example: `true`, description: 'status of quiz' })
  status!: boolean;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: [
      {
        quiz_id: 4,
        answer: 'answer',
        question: 'question',
        result: 'result',
        type: 'type',
        user_answer_index: 2,
        ai_answer: 'ai_answer',
        user_answer: 'user_answer',
        correct_answer_index: 2,
      },
      {
        quiz_id: 4,
        answer: 'answer 1',
        question: 'question 1',
        result: 'result 1',
        type: 'type 1',
        user_answer_index: 3,
        ai_answer: 'ai_answer 1',
        user_answer: 'user_answer 1',
        correct_answer_index: 2,
      },
      {
        quiz_id: 4,
        answer: 'answer 2',
        question: 'question 2',
        result: 'result 2',
        type: 'type 2',
        user_answer_index: 3,
        ai_answer: 'ai_answer 2',
        user_answer: 'user_answer 2',
        correct_answer_index: 2,
      },
    ],
  })
  questions: Question[];
}
