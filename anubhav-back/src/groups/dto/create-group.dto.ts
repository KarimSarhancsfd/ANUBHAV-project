import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsUrl,
} from 'class-validator';

export class CreateGroupsDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  background_color?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  background_cover_url?: string;
}
