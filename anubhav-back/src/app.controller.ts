import { Controller, Get , UseGuards , Req} from '@nestjs/common';
import { AppService } from './app.service';
import {HttpException, HttpStatus} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

   @Get()
   @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 authentication flow
    // return this.appService.googleAuth(req);
   
  }
  @Get('auth/apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthRedirect(@Req() req) {
    if (!req.user) {
      throw new HttpException('Apple authentication failed', HttpStatus.UNAUTHORIZED);
    }
    return this.appService.getgoogleLogin(req.user);
  }



  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    if (!req.user) {
      throw new HttpException('Google authentication failed', HttpStatus.UNAUTHORIZED);
    }
    return this.appService.getgoogleLogin(req.user);
  }
}
