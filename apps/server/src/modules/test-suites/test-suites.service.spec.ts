import { Test, TestingModule } from '@nestjs/testing';
import { TestSuitesService } from './test-suites.service';

describe('TestSuitesService', () => {
  let service: TestSuitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestSuitesService],
    }).compile();

    service = module.get<TestSuitesService>(TestSuitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
