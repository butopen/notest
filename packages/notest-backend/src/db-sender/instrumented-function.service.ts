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
                filepath text,
                functionname text,
                line integer,
                nttype text CHECK (nttype IN ('input' , 'output' , 'variable' , 'expression' , 'exception')),
                value text,
                fired TIMESTAMPTZ,
                created TIMESTAMPTZ
            );
        `)
  }

  save(event: InstrumentedFunctionEvent) {
    this.db.query(``)
  }

  /*


async bulkSave(data: { scope: Required<{ [key: string]: any }>, data: BLSessionEvent }[]): Promise<{ hitid: number }[]> {
        let index = 1
        let params: any[] = []
        let values = data.map(d => {
            params.push(d.data.url, d.data.name, d.data.type, d.data.sid, d.data.tab, d.data.timestamp, d.scope, d.data, new Date())
            return `(DEFAULT, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})`
        }).join(",")
        let result = (await this.db.query<{ hitid: number }>(`insert into blhit values ${values} RETURNING hitid`, params, {skipLogging: true}))
        return result
    }

 */

}
