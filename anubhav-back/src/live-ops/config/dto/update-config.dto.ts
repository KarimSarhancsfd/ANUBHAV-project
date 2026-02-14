import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConfigType } from '../entities/remote-config.entity';

export class UpdateConfigDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 6,
    description: 'Config value (can be any type)',
  })
  value: any;

  @IsOptional()
  @IsEnum(ConfigType)
  @ApiProperty({
    example: 'number',
    description: 'Config value type',
    enum: ConfigType,
    required: false,
  })
  type?: ConfigType;
}
