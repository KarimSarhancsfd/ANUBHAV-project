import { PartialType } from '@nestjs/swagger';
import { CreateUserActivitiesDto } from './create-useractivities.dto';

export class UpdateUserActivitiesDto extends PartialType(CreateUserActivitiesDto ) {}
