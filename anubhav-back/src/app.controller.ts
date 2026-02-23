/**
 * @file app.controller.ts
 * @description Root application controller handling primary routing and OAuth authentication callbacks.
 * Handles Google and Apple OAuth2 authentication redirects.
 */
import { Controller, Get , UseGuards , Req} from '@nestjs/common';
import { AppService } from './app.service';
import {HttpException, HttpStatus} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

/**
 * @class AppController
 * @description Primary controller for application root endpoints and OAuth callbacks.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * @route GET /
   * @description Health check endpoint returning basic greeting.
   * @returns {string} Hello World message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * @route GET /auth/google
   * @description Initiates Google OAuth2 authentication flow.
   * @uses AuthGuard('google')
   */
   @Get()
   @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 authentication flow
  }

  /**
   * @route GET /auth/apple/callback
   * @description Handles Apple OAuth2 authentication callback.
   * @uses AuthGuard('apple')
   * @throws {HttpException} 401 - Apple authentication failed
   * @returns {Object} User information from Apple OAuth
   */
  @Get('auth/apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthRedirect(@Req() req) {
    if (!req.user) {
      throw new HttpException('Apple authentication failed', HttpStatus.UNAUTHORIZED);
    }
    return this.appService.getgoogleLogin(req.user);
  }

  /**
   * @route GET /auth/google/callback
   * @description Handles Google OAuth2 authentication callback.
   * @uses AuthGuard('google')
   * @throws {HttpException} 401 - Google authentication failed
   * @returns {Object} User information from Google OAuth
   */
  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    if (!req.user) {
      throw new HttpException('Google authentication failed', HttpStatus.UNAUTHORIZED);
    }
    return this.appService.getgoogleLogin(req.user);
  }
}
