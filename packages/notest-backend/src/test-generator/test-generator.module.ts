import {Module} from '@nestjs/common';
import {TestGeneratorController} from './test-generator.controller';
import {TestGeneratorService} from './test-generator.service';

@Module({
  controllers: [TestGeneratorController],
  providers: [TestGeneratorService]
})
export class TestGeneratorModule {
}
