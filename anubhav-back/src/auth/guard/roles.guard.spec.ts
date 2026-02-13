import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('should allow access if no role is required', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'user' } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('role', expect.any(Function));
    });

    it('should allow access if the user has the required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValue('admin');

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'admin' } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('role', expect.any(Function));
    });

    it('should throw UnauthorizedException if the user does not have the required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValue('admin');

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: 'user' } }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      expect(() => rolesGuard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if there is no user in the request', () => {
      jest.spyOn(reflector, 'get').mockReturnValue('admin');

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: null }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      expect(() => rolesGuard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
    });
  });
});
