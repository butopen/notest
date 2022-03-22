import {Module} from '@nestjs/common';
import {Config, ConfigService} from "./config.service";
import {loadConfig} from "./config.function";
import {DB, PostgresDbService} from "./postgres-db.service";

const config: Config = loadConfig()

@Module({
  providers: [
    {provide: DB, useValue: new PostgresDbService(config.db)},
    {provide: ConfigService, useValue: config}
  ],
  exports: [DB, ConfigService]
})
export class PostgresDbModule {
}