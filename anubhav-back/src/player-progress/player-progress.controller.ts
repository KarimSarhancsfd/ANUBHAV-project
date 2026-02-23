/**
 * @file player-progress.controller.ts
 * @description Controller for handling player progress-related HTTP requests.
 * Provides endpoints for retrieving player progress data and dashboard information.
 */
import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { PlayerProgressService } from './player-progress.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

/**
 * Controller for managing player progress endpoints.
 * All routes are protected with JWT authentication.
 */
@Controller('player-progress')
@UseGuards(JwtAuthGuard)
export class PlayerProgressController {
  constructor(private readonly progressService: PlayerProgressService) {}

  /**
   * Retrieves the authenticated user's progress data.
   * @param req - The request object containing the authenticated user.
   * @returns The player's progress including level, XP, stats, and achievements.
   */
  @Get('me')
  async getMyProgress(@Request() req) {
    return this.progressService.getProgress(req.user.id);
  }

  /**
   * Retrieves the dashboard data for the authenticated user.
   * Combines progress, wallet, and live ops status in a single response.
   * @param req - The request object containing the authenticated user.
   * @returns Dashboard data with progress, economy, and live ops information.
   */
  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.progressService.getDashboardData(req.user.id);
  }

  /**
   * Retrieves progress data for a specific player by user ID.
   * @param userId - The ID of the player to retrieve progress for.
   * @returns The player's progress data.
   */
  @Get(':userId')
  async getPlayerProgress(@Param('userId') userId: string) {
    return this.progressService.getProgress(+userId);
  }
}
