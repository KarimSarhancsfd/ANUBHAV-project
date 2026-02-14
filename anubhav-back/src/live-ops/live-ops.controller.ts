import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveOpsService } from './live-ops.service';

@ApiTags('LiveOps')
@Controller('live-ops')
export class LiveOpsController {
  constructor(private readonly liveOpsService: LiveOpsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get LiveOps system status' })
  async getStatus() {
    return this.liveOpsService.getSystemStatus();
  }

  @Post('trigger/:eventId')
  @ApiOperation({ summary: 'Manually trigger a live event' })
  async triggerEvent(@Param('eventId') eventId: string) {
    return this.liveOpsService.triggerEvent(eventId);
  }

  @Post('config/:key/push')
  @ApiOperation({ summary: 'Push config update to all connected clients' })
  async pushConfig(@Param('key') key: string) {
    return this.liveOpsService.pushConfigUpdate(key);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get recent LiveOps activity logs' })
  async getLogs(@Query('limit') limit: number = 50) {
    return this.liveOpsService.getRecentLogs(limit);
  }
}
