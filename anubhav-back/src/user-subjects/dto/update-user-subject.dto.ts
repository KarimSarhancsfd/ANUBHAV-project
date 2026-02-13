import { PartialType } from '@nestjs/swagger';
import { CreateUserSubjectDto } from './create-user-subject.dto';

export class UpdateUserSubjectDto extends PartialType(CreateUserSubjectDto) {}
