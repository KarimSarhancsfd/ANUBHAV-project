import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'ID of the Match/Session (Legacy Quiz)' })
  quiz_id: number;

  /** @deprecated Use eventTrigger for gaming context */
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Defeat 10 enemies', description: 'Event trigger or challenge description' })
  question: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: false, example: true, description: 'Success/Fail result state' })
  result: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'COMBAT', description: 'Challenge type (e.g., COMBAT, PUZZLE)' })
  type: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 0,
    description: 'User selection index',
  })
  user_answer_index: number;

  /** @deprecated Use payloadSignature for gaming context */
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'Expected payload signature or correct index',
  })
  correct_answer_index: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'signature_v1', description: 'Internal verification payload' })
  ai_answer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'player_input_raw', description: 'Captured player input' })
  user_answer: string;
}
