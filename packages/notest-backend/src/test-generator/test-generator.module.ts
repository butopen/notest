import {Module} from '@nestjs/common';
import {TestGeneratorController} from './test-generator.controller';
import {TestGeneratorService} from './test-generator.service';
import {PostgresDbModule} from "../postgres/postgres-db.module";

@Module({
  imports: [PostgresDbModule],
  controllers: [TestGeneratorController],
  providers: [TestGeneratorService]
})
export class TestGeneratorModule {
}
