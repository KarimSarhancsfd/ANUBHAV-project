/**
 * @file auth.controller.ts
 * @description Authentication controller handling OAuth flows for Apple and Google.
 * Routes: /auth/apple, /auth/apple/callback, /auth/google/callback
 */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @class AuthController
 * @description Handles OAuth2 authentication endpoints for external providers.
 */
@Controller('auth')
export class AuthController {

  /**
   * @route GET /auth/apple
   * @description Initiates Apple OAuth2 authentication flow.
   * @uses AuthGuard('apple')
   */
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth() {
    // Initiates the Apple OAuth flow
  }

  /**
   * @route GET /auth/apple/callback
   * @description Handles Apple OAuth2 authentication callback.
   * @uses AuthGuard('apple')
   * @param {Request} req - Request object containing OAuth user data
   * @returns {Object} User information from Apple OAuth
   */
  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthCallback(@Req() req) {
    return req.user;
  }
}