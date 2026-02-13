import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

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
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });
   
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      await controller.findAll();
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userDto = { name: 'Test User' };
      await controller.create(userDto);
      expect(userService.create).toHaveBeenCalledWith(userDto);
    });
  });
   
  describe('findOne', () => {
    it('should return an array of users', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(userService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const userDto = { name: 'Updated User' };
      await controller.update(id, userDto);
      expect(userService.update).toHaveBeenCalledWith(+id, userDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';
      await controller.remove(id);
      expect(userService.remove).toHaveBeenCalledWith(+id);
    });
  });


});
