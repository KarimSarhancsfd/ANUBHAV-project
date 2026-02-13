import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';

const mockUserService = {
  findOne: jest.fn(),
};

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    const mockRequest: any = {
      headers: {
        authorization: 'Bearer validToken',
      },
    };

    it('should throw UnauthorizedException if token is missing', async () => {
      const requestWithoutToken: any = {
        headers: {
          authorization: '',
        },
      };

      await expect(
        jwtStrategy.validate(requestWithoutToken, { id: 1 })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        jwtStrategy.validate(mockRequest, { id: 1 })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token does not match', async () => {
      mockUserService.findOne.mockResolvedValue({ id: 1, token: 'differentToken' });

      await expect(
        jwtStrategy.validate(mockRequest, { id: 1 })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return the user if validation succeeds', async () => {
      const mockUser = { id: 1, token: 'validToken' };
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(mockRequest, { id: 1 });

      expect(result).toEqual(mockUser);
    });
  });

  describe('extractJwtToken', () => {
    it('should return null if authorization header is missing', () => {
      const request: any = { headers: {} };

      const result = jwtStrategy["extractJwtToken"](request);

      expect(result).toBeNull();
    });

    it('should return null if authorization header does not start with Bearer', () => {
      const request: any = {
        headers: { authorization: 'Invalid token' },
      };

      const result = jwtStrategy["extractJwtToken"](request);

      expect(result).toBeNull();
    });

    it('should return the token if authorization header is valid', () => {
      const request: any = {
        headers: { authorization: 'Bearer validToken' },
      };

      const result = jwtStrategy["extractJwtToken"](request);

      expect(result).toBe('validToken');
    });
  });
});
