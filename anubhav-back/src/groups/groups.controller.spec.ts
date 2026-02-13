import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
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

    controller = module.get<GroupsController>(GroupsController);
    groupsService = module.get<GroupsService>(GroupsService);
  });
   
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of groups', async () => {
      await controller.findAll();
      expect(groupsService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a groups', async () => {
      const groupsDto = { name: 'Test Groups' };
      await controller.create(groupsDto);
      expect(groupsService.create).toHaveBeenCalledWith(groupsDto);
    });
  });
   
  describe('findOne', () => {
    it('should return an array of groups', async () => {
      const id = '1';
      await controller.findOne(id);
      expect(groupsService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should update a groups', async () => {
      const id = '1';
      const groupsDto = { name: 'Updated Groups' };
      await controller.update(id, groupsDto);
      expect(groupsService.update).toHaveBeenCalledWith(+id, groupsDto);
    });
  });

  describe('remove', () => {
    it('should remove a groups', async () => {
      const id = '1';
      await controller.remove(id);
      expect(groupsService.remove).toHaveBeenCalledWith(+id);
    });
  });


});
