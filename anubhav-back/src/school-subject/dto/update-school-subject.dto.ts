import { PartialType } from '@nestjs/swagger';
import { CreateSchoolSubjectDto } from './create-school-subject.dto';

export class UpdateSchoolSubjectDto extends PartialType(CreateSchoolSubjectDto) {}
