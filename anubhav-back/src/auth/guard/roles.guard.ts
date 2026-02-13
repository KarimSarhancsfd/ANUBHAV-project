import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export type UserRole = { userId: number, role: string }

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the route's metadata
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    if (!requiredRole) {
      return true; // No specific role required, allow access
    }

    // Extract the user from the request
    const request: Request = context.switchToHttp().getRequest();
    const user: UserRole = request.user as any;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }
    
    // Check if the user's role matches the required role
    if (user.role !== requiredRole) {
      throw new UnauthorizedException('You do not have permission to access this resource');
    }

    return true;
  }
}
