import { IsBoolean, IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/user/entities/user.entity';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  receiver_id: User;

  @IsNumber()
  @IsNotEmpty()
  sender_id: User;

  @IsNumber()
  @IsNotEmpty()
  group_id: Group;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsJSON()
  @IsOptional()
  data?: any;

  @IsBoolean()
  @IsOptional()
  seen?: boolean;

  @IsBoolean()
  @IsOptional()
  accept_request?: boolean;
}
