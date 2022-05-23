import {Module} from '@nestjs/common';
import {DbEventApiService} from './db-event-api.service';
import {PostgresDbModule} from "../postgres/postgres-db.module";

@Module({
  imports: [PostgresDbModule],
  providers: [DbEventApiService],
  exports: [DbEventApiService]
})
export class DbEventApiModule {
}
