import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockReq: any = { user: { userId: 1, role: 'admin' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      await controller.findAll(mockReq);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        country_id: 1 as any,
        user_name: 'testuser',
      };
      await controller.create(userDto);
      expect(userService.create).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(userService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const userDto = { user_name: 'Updated User' };
      await controller.update(id, userDto);
      expect(userService.update).toHaveBeenCalledWith(+id, userDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';
      await controller.remove(id, mockReq);
      expect(userService.remove).toHaveBeenCalledWith(+id, mockReq.user);
    });
  });
});
