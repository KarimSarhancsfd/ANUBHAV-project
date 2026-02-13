import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class AnswerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Question ID' })
  questionId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'User answer index' })
  answer: number;
}