import {Injectable} from '@nestjs/common';
import {InstrumentedFunctionEvent} from "@butopen/notest-model";
import {DB} from "../postgres/postgres-db.service";

@Injectable()
export class InstrumentedFunctionService {
  private tableName = 'instrumentedfunctionevent'

  constructor(private db: DB) {
  }

  async onModuleInit() {
    await this.generateTable()
  }

  async generateTable() {
    await this.db.query(`
            create table if not exists ${this.tableName} (
                infoid BIGSERIAL PRIMARY KEY,
                scripttype text CHECK (scripttype IN ('function' , 'method')),
                nttype text CHECK (nttype IN ('input' , 'output' , 'variable' , 'expression' , 'exception')),
                value text,
                line integer,
                functionname text,
                filepath text,
                fired bigint,
                other JSONB,
                created TIMESTAMPTZ
            );
        `)
  }

  async bulkSave(data: InstrumentedFunctionEvent[]): Promise<{ infoid: number }[]> {
    let index = 1
    let params: any[] = []
    let values = data.map(d => {
      params.push(d.script, d.type, d.value, d.line, d.function, d.file, d.timestamp, d.other, new Date())
      return `(DEFAULT, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})`
    }).join(",")
    let result = (await this.db.query<{ infoid: number }>(`insert into instrumentedfunctionevent values ${values} RETURNING infoid`, params, {skipLogging: true}))
    return result
  }
}
