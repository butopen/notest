import {Module} from '@nestjs/common';
import {DbSenderController} from './db-sender.controller';
import {DbSenderService} from './db-sender.service';
import {PostgresDbModule} from "../postgres/postgres-db.module";

@Module({
  imports: [PostgresDbModule],
  controllers: [DbSenderController],
  providers: [DbSenderService],
})
export class DbSenderModule {
}
