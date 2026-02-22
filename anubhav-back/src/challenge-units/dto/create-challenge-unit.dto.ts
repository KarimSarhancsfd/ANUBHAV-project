import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChallengeUnitDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'event_trigger', description: 'gaming event identifier' })
    question: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 1, description: 'weight / mark value' })
    mark_value: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 0, description: 'correct index' })
    correct_answer_index: number;
}
