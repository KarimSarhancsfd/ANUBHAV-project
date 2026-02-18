import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveOpsService } from './live-ops.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/decorator/roles.decorator';

@ApiTags('LiveOps')
@Controller('live-ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
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
