/**
 * @file LiveOps Controller
 * @description REST API controller for LiveOps operations including system status,
 * event triggering, config pushing, and activity logs retrieval.
 */
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveOpsService } from './live-ops.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/decorator/roles.decorator';

/**
 * @file LiveOps Controller
 * @description REST API controller for LiveOps operations including system status,
 * event triggering, config pushing, and activity logs retrieval.
 */
@ApiTags('LiveOps')
@Controller('live-ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
export class LiveOpsController {
  constructor(private readonly liveOpsService: LiveOpsService) {}

  /**
   * @method getStatus
   * @description Retrieves the current operational status of the LiveOps system.
   * @returns {Promise<Object>} System status including active events count, config count, and connected clients.
   */
  @Get('status')
  @ApiOperation({ summary: 'Get LiveOps system status' })
  async getStatus() {
    return this.liveOpsService.getSystemStatus();
  }

  /**
   * @method triggerEvent
   * @description Manually triggers a live event by its ID.
   * @param {string} eventId - The unique identifier of the event to trigger.
   * @returns {Promise<Object>} The triggered event data.
   */
  @Post('trigger/:eventId')
  @ApiOperation({ summary: 'Manually trigger a live event' })
  async triggerEvent(@Param('eventId') eventId: string) {
    return this.liveOpsService.triggerEvent(eventId);
  }

  /**
   * @method pushConfig
   * @description Pushes a configuration update to all connected clients via WebSocket.
   * @param {string} key - The configuration key to push.
   * @returns {Promise<Object>} The configuration data that was pushed.
   */
  @Post('config/:key/push')
  @ApiOperation({ summary: 'Push config update to all connected clients' })
  async pushConfig(@Param('key') key: string) {
    return this.liveOpsService.pushConfigUpdate(key);
  }

  /**
   * @method getLogs
   * @description Retrieves recent LiveOps activity logs.
   * @param {number} limit - Maximum number of logs to retrieve (default: 50).
   * @returns {Promise<Array>} Array of recent log entries.
   */
  @Get('logs')
  @ApiOperation({ summary: 'Get recent LiveOps activity logs' })
  async getLogs(@Query('limit') limit: number = 50) {
    return this.liveOpsService.getRecentLogs(limit);
  }
}
