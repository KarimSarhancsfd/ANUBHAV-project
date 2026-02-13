import { Test, TestingModule } from '@nestjs/testing';
import { UserActivitiesController } from './useractivities.controller';
import { UserActivitiesService } from './useractivities.service';
import { CreateUserActivitiesDto } from './dto/create-useractivities.dto';
import { UpdateUserActivitiesDto } from './dto/update-useractivities.dto';

describe('UserActivitiesController', () => {
  let controller: UserActivitiesController;
  let service: UserActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActivitiesController],
      providers: [
        {
          provide: UserActivitiesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserActivitiesController>(UserActivitiesController);
    service = module.get<UserActivitiesService>(UserActivitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of useractivities', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a useractivities', async () => {
      const useractivitiesDto: CreateUserActivitiesDto = {
        userId: 1,
        activityType: 'login',
        description: 'User logged in',
        timestamp: new Date().toISOString(),
      };
      await controller.create(useractivitiesDto);
      expect(service.create).toHaveBeenCalledWith(useractivitiesDto);
    });
  });

  describe('findOne', () => {
    it('should return a useractivities', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should update a useractivities', async () => {
      const id = '1';
      const updateDto: UpdateUserActivitiesDto = {
        activityType: 'logout',
        description: 'User logged out',
        timestamp: new Date().toISOString(),
      };
      await controller.update(id, updateDto);
      expect(service.update).toHaveBeenCalledWith(+id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a useractivities', async () => {
      const id = '1';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(+id);
    });
  });
});
