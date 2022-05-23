import {Injectable} from '@nestjs/common';
import {DB} from "../postgres/postgres-db.service";
import {InstrumentedEvent} from "@butopen/notest-model/dist";
import {DbEventApiService} from "../db-event-api/db-event-api.service";

@Injectable()
export class StoryApiService {
  constructor(private readonly db: DB, private dbEventApi: DbEventApiService) {
  }

  async getFullTextOfRoutine(request: { path: string; name: string; created: string }) {
    const result = await this.dbEventApi.getFullTextFromDb(request)
    result[0].value = Buffer.from(result[0].value, 'base64').toString('binary')
    return result[0]
  }

  async getRoutine(request: { path: string; name: string; created: string }) {
    const result = await this.dbEventApi.getRoutine(request)

    let routine: { inputs: InstrumentedEvent[], statements: InstrumentedEvent[], output: InstrumentedEvent }
      = {inputs: [], statements: [], output: undefined}

    result.forEach((event: InstrumentedEvent) => {
      switch (event.type) {
        case 'input': {
          routine.inputs.push(event)
          break;
        }
        case 'variable': {
          routine.statements.push(event)
          break;
        }
        case 'expression': {
          routine.statements.push(event)
          break;
        }
        case 'output': {
          routine.output = event
          break;
        }
      }
    })
    return routine;
  }
}
