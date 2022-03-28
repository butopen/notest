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
                nttype text CHECK (nttype IN ('input' , 'output' , 'variable' , 'expression' , 'exception')),
                value text,
                line integer,
                functionname text,
                filepath text,
                fired TIMESTAMPTZ,
                other JSONB,
                created TIMESTAMPTZ
            );
        `)
  }

  save(event: InstrumentedFunctionEvent) {
    this.db.query(``)
  }


  async bulkSave(data: InstrumentedFunctionEvent[]): Promise<{ infoid: number }[]> {
    let index = 1
    let params: any[] = []
    let values = data.map(d => {
      params.push(d.type, d.value, d.line, d.function, d.file, d.timestamp, d.other, new Date())
      return `(DEFAULT, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})`
    }).join(",")
    let result = (await this.db.query<{ infoid: number }>(`insert into blhit values ${values} RETURNING hitid`, params, {skipLogging: true}))
    return result
  }
}
