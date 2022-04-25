import {Injectable} from "@nestjs/common";
import {DBConfig} from "./postgres-db.service";

export interface Config {
  db: DBConfig
}

@Injectable()
export class ConfigService implements Config {
  db: DBConfig
}