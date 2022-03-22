import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostgresDbModule} from "./postgres/postgres-db.module";
import {DbSenderModule} from './db-sender/db-sender.module';

@Module({
  imports: [PostgresDbModule, DbSenderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
