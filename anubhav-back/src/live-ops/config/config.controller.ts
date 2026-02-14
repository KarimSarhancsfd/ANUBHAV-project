import { Controller, Get, Put, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('LiveOps Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all remote configs' })
  async getAllConfigs() {
    return this.configService.getAllConfigs();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get specific config by key' })
  async getConfig(@Param('key') key: string) {
    return this.configService.getConfig(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update or create config' })
  async updateConfig(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configService.setConfig(key, dto.value, dto.type);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete config' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfig(@Param('key') key: string) {
    await this.configService.deleteConfig(key);
  }
}
