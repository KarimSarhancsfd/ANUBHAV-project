import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ChallengeUnit } from '../entities/challenge-unit.entity';

export class SubmitChallengeUnitDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 'question_id', description: 'challenge_id' })
    question_id: ChallengeUnit;

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
    @ApiProperty({ type: [SubmitChallengeUnitDto] })
    questions: SubmitChallengeUnitDto[];
}
