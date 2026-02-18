import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { PlayerProgressService } from './player-progress.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('player-progress')
@UseGuards(JwtAuthGuard)
export class PlayerProgressController {
  constructor(private readonly progressService: PlayerProgressService) {}

  @Get('me')
  async getMyProgress(@Request() req) {
    return this.progressService.getProgress(req.user.id);
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.progressService.getDashboardData(req.user.id);
  }

  @Get(':userId')
  async getPlayerProgress(@Param('userId') userId: string) {
    return this.progressService.getProgress(+userId);
  }
}
