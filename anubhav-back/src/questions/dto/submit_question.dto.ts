import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Question } from '../entities/question.entity';

export class SubmitQuestionDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 'question_id', description: 'question_id' })
    question_id: Question;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 'user_answer_index', description: 'user_answer_index', })
    user_answer_index: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'user_answer', description: 'user_answer' })
    user_answer: string;
}

export class SubmitQuestionsDto {
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({ type: [SubmitQuestionDto] })
    questions: SubmitQuestionDto[];
}