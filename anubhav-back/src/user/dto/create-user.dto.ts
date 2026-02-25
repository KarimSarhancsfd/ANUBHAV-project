import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Country } from 'src/country/entities/country.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@gmail.com', description: 'email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password', description: 'password' })
  password: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 'country', description: 'country' })
  country_id: Country;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user_name', description: 'user name' })
  user_name: string;
}
