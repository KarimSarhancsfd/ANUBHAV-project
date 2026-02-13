import { Test, TestingModule } from '@nestjs/testing';
import { UserSubjectsService } from './user-subjects.service';

describe('UserSubjectsService', () => {
  let service: UserSubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSubjectsService],
    }).compile();

    service = module.get<UserSubjectsService>(UserSubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
