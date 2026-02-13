import {
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  IsNumber,
} from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreateUserActivitiesDto {
  @IsInt()
  @IsNotEmpty()
  user_id: User;

  @IsNumber()
  @IsNotEmpty()
  count: number;

  @IsString()
  @Length(0, 255)
  date: string;
}
