import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostgresDbModule} from "./postgres/postgres-db.module";
import {InstrumentationModule} from './instrumentation/instrumentation.module';
import {TestGeneratorModule} from './test-generator/test-generator.module';
import { StoryApiModule } from './story-api/story-api.module';
import { DbEventApiModule } from './db-event-api/db-event-api.module';

@Module({
  imports: [PostgresDbModule, InstrumentationModule, TestGeneratorModule, StoryApiModule, DbEventApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
