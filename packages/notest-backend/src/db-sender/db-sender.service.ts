import {Injectable} from '@nestjs/common';
import {CollectEvent} from "@butopen/notest-collector/dist";
import {DB} from "../postgres/postgres-db.service";

@Injectable()
export class DbSenderService {
  private tableName = 'fnist'

  constructor(private db: DB) {
  }

  async onModuleInit() {
    await this.generateTable()
  }

  async generateTable() {
    await this.db.query(`
            create table if not exists ${this.tableName} (
                infoId BIGSERIAL PRIMARY KEY,
                file text,
                functionName text,
                line text,
                type text,
                value text,
                timestamp text,
                created TIMESTAMPTZ,
                raw jsonb,
            );
        `)
  }

  sendToDb(event: CollectEvent) {
    this.db.query(``)
  }
}
