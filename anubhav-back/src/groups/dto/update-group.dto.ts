import { PartialType } from '@nestjs/swagger';
import { CreateGroupsDto } from './create-group.dto';

export class UpdateGroupsDto extends PartialType(CreateGroupsDto) {}
