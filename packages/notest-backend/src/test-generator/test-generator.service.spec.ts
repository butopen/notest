import { Test, TestingModule } from '@nestjs/testing';
import { TestGeneratorService } from './test-generator.service';

describe('TestGeneratorService', () => {
  let service: TestGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestGeneratorService],
    }).compile();

    service = module.get<TestGeneratorService>(TestGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
