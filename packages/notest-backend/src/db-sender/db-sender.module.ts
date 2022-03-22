import {Module} from '@nestjs/common';
import {InstrumentedEventController} from './instrumented-event.controller';
import {InstrumentedFunctionService} from './instrumented-function.service';
import {PostgresDbModule} from "../postgres/postgres-db.module";

@Module({
  imports: [PostgresDbModule],
  controllers: [InstrumentedEventController],
  providers: [InstrumentedFunctionService],
})
export class DbSenderModule {
}
