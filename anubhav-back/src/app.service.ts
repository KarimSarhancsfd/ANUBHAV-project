/**
 * @file app.service.ts
 * @description Core application service providing root-level functionality.
 * Handles health checks and OAuth user data processing.
 */
import { Injectable } from '@nestjs/common';

/**
 * @class AppService
 * @description Root service for application-level operations.
 */
@Injectable()
export class AppService {
  /**
   * @method getHello
   * @description Returns health check message.
   * @returns {string} Default greeting message
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * @method getgoogleLogin
   * @description Processes OAuth user data from Google/Apple providers.
   * @param {Object} req - OAuth response containing user data
   * @param {Object} req.user - User information from OAuth provider
   * @returns {Object} Standardized user information response
   */
   getgoogleLogin(req: any): any {
    if(!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User information from Google',
      user: req.user,
    };
  }
}


