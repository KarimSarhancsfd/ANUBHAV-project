import { PartialType } from '@nestjs/swagger';
import { CreateMatchSessionDto } from './create-match-session.dto';

export class UpdateMatchSessionDto extends PartialType(CreateMatchSessionDto) {}
