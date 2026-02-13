import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { forwardRef } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOne: jest.fn(),
    updateToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useFactory: () => mockUserService,
        },
        {
          provide: JwtService,
          useFactory: () => mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const mockPayload = { id: '1', username: 'testuser' };
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      const mockToken = 'mock.jwt.token';

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);
      mockUserService.updateToken.mockResolvedValue(undefined);

      const result = await authService.generateAccessToken(mockPayload);

      expect(mockUserService.findOne).toHaveBeenCalledWith(mockPayload.id);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(mockPayload, { secret: "T!@!8934" });
      expect(mockUserService.updateToken).toHaveBeenCalledWith(mockPayload.id, mockToken);
      expect(result).toEqual({ access_token: mockToken });
    });


    it('should throw an error if token generation fails', async () => {
      const mockPayload = { id: '1', username: 'testuser' };
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockRejectedValue(new Error('Token generation failed'));

      await expect(authService.generateAccessToken(mockPayload)).rejects.toThrow('Token generation failed');
    });

    it('should throw an error if token update fails', async () => {
      const mockPayload = { id: '1', username: 'testuser' };
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      const mockToken = 'mock.jwt.token';

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);
      mockUserService.updateToken.mockRejectedValue(new Error('Token update failed'));

      await expect(authService.generateAccessToken(mockPayload)).rejects.toThrow('Token update failed');
    });
  });
});