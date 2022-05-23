import {Module} from '@nestjs/common';
import {StoryApiService} from './story-api.service';
import {StoryApiController} from './story-api.controller';
import {PostgresDbModule} from "../postgres/postgres-db.module";
import {DbEventApiModule} from "../db-event-api/db-event-api.module";

@Module({
  imports: [PostgresDbModule, DbEventApiModule],
  providers: [StoryApiService],
  controllers: [StoryApiController]
})
export class StoryApiModule {
}
