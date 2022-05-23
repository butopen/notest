import {Module} from '@nestjs/common';
import {TestGeneratorController} from './test-generator.controller';
import {TestGeneratorService} from './test-generator.service';
import {PostgresDbModule} from "../postgres/postgres-db.module";
import {DbEventApiModule} from "../db-event-api/db-event-api.module";

@Module({
  imports: [PostgresDbModule, DbEventApiModule],
  controllers: [TestGeneratorController],
  providers: [TestGeneratorService]
})
export class TestGeneratorModule {
}
