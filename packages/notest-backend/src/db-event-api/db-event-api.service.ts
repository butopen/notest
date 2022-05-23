import {Injectable} from '@nestjs/common';
import {DB} from "../postgres/postgres-db.service";
import {mapToInstrumentedEvent} from "../story-api/story-api.utils";

@Injectable()
export class DbEventApiService {
  constructor(private db: DB) {
  }

  async getAllRoutinesFromDb(request: { scriptType: string; filePath: string; functionName: string; }) {
    return await this.db.query(`select * from instrumentedEvent 
                      where scripttype = '${request.scriptType}'
                            and filepath = '${request.filePath}'
                            and functionname = '${request.functionName}'
                      order by fired,line`).then((values) => mapToInstrumentedEvent(values));
  }

  async getFullTextFromDb(request: { path: string; name: string; created: string }) {
    return await this.db.query(`
                    select * 
                    from instrumentedevent
                    where filepath = ${request.path}
                      and functionname = ${request.name}
                      and fired = ${request.created}
                      and nttype = 'text'`).then((values) => mapToInstrumentedEvent(values))
  }

  async getRoutine(request: { path: string; name: string; created: string }) {
    return await this.db.query(`
                    select * 
                    from instrumentedevent
                    where filepath = ${request.path}
                      and functionname = ${request.name}
                      and fired = ${request.created}`).then((values) => mapToInstrumentedEvent(values))
  }
}
