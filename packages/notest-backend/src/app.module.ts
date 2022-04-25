import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostgresDbModule} from "./postgres/postgres-db.module";
import {InstrumentationModule} from './instrumentation/instrumentation.module';

@Module({
  imports: [PostgresDbModule, InstrumentationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
