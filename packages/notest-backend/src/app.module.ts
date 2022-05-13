import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostgresDbModule} from "./postgres/postgres-db.module";
import {InstrumentationModule} from './instrumentation/instrumentation.module';
import {TestGeneratorModule} from './test-generator/test-generator.module';

@Module({
  imports: [PostgresDbModule, InstrumentationModule, TestGeneratorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
