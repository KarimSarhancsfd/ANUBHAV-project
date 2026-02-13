import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
   getgoogleLogin(req: any): any {
    if(!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User information from Google',
      user: req.user, // This will contain the user information returned by the Google strategy
    };
  }
  }

 



