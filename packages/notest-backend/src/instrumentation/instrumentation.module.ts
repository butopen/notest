import {Module} from '@nestjs/common';
import {InstrumentedEventController} from './instrumented-event.controller';
import {InstrumentedService} from './instrumented.service';
import {PostgresDbModule} from "../postgres/postgres-db.module";

@Module({
  imports: [PostgresDbModule],
  controllers: [InstrumentedEventController],
  providers: [InstrumentedService],
})
export class InstrumentationModule {
}
