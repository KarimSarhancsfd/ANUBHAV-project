import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PlayerProgressService } from './player-progress.service';

@Controller('player-progress')
export class PlayerProgressController {
  constructor(private readonly progressService: PlayerProgressService) {}

  @Get('me')
  async getMyProgress(@Request() req) {
    // Assuming user id is available in request after auth guard
    // For now, if no auth is implemented, we might need a dummy or wait for integration
    return this.progressService.getProgress(req.user?.id || 1);
  }

  @Get(':userId')
  async getPlayerProgress(@Param('userId') userId: string) {
    return this.progressService.getProgress(+userId);
  }
}
