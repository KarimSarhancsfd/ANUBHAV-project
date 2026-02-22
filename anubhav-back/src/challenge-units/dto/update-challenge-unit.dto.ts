import { PartialType } from '@nestjs/swagger';
import { CreateChallengeUnitDto } from './create-challenge-unit.dto';

export class UpdateChallengeUnitDto extends PartialType(CreateChallengeUnitDto) {}
