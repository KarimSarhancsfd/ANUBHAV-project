import { Test, TestingModule } from '@nestjs/testing';
import { UserSubjectsController } from './user-subjects.controller';
import { UserSubjectsService } from './user-subjects.service';

describe('UserSubjectsController', () => {
  let controller: UserSubjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSubjectsController],
      providers: [UserSubjectsService],
    }).compile();

    controller = module.get<UserSubjectsController>(UserSubjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
