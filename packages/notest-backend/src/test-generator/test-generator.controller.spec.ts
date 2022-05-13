import {Test, TestingModule} from '@nestjs/testing';
import {TestGeneratorController} from './test-generator.controller';

describe('TestGeneratorController', () => {
  let controller: TestGeneratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestGeneratorController],
    }).compile();

    controller = module.get<TestGeneratorController>(TestGeneratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
