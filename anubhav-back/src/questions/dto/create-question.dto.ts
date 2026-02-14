import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'quiz_id' })
  quiz_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'question', description: 'question' })
  question: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({default: false , example: true, description: 'result' })
  result: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'type', description: 'type' })
  type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user_answer_index',
    description: 'user_answer_index',
  })
  user_answer_index: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'correct_answer_index',
    description: 'correct_answer_index',
  })
  correct_answer_index: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'ai_answer', description: 'ai_answer' })
  ai_answer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user_answer', description: 'user_answer' })
  user_answer: string;
}
