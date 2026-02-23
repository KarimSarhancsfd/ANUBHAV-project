/**
 * @file Config Controller
 * @description REST API controller for managing remote configuration settings.
 * Provides endpoints to retrieve, create, update, and delete configuration values.
 */
import { Controller, Get, Put, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

/**
 * @class ConfigController
 * @description Controller for handling remote configuration CRUD operations.
 */
@ApiTags('LiveOps Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * @method getAllConfigs
   * @description Retrieves all remote configuration entries.
   * @returns {Promise<Array>} Array of all configuration objects.
   */
  @Get()
  @ApiOperation({ summary: 'Get all remote configs' })
  async getAllConfigs() {
    return this.configService.getAllConfigs();
  }

  /**
   * @method getConfig
   * @description Retrieves a specific configuration by its key.
   * @param {string} key - The configuration key to retrieve.
   * @returns {Promise<Object>} The configuration object.
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get specific config by key' })
  async getConfig(@Param('key') key: string) {
    return this.configService.getConfig(key);
  }

  /**
   * @method updateConfig
   * @description Updates an existing configuration or creates a new one if it doesn't exist.
   * @param {string} key - The configuration key to update or create.
   * @param {UpdateConfigDto} dto - The DTO containing the new value and type.
   * @returns {Promise<Object>} The saved configuration object.
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update or create config' })
  async updateConfig(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configService.setConfig(key, dto.value, dto.type);
  }

  /**
   * @method deleteConfig
   * @description Deletes a configuration by its key.
   * @param {string} key - The configuration key to delete.
   * @returns {Promise<void>}
   */
  @Delete(':key')
  @ApiOperation({ summary: 'Delete config' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfig(@Param('key') key: string) {
    await this.configService.deleteConfig(key);
  }
}
