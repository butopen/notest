import {DBConfig, PostgresDbService} from "../../dist/postgres/postgres-db.service";
import {InstrumentedFunctionEvent} from "@butopen/notest-model";
import {InstrumentedFunctionService} from "../../dist/instrumentation/instrumented-function.service";

describe("Test add event to DB", () => {
  const testConfig: DBConfig = {
    "host": "localhost",
    "user": "postgres",
    "password": "password",
    "database": "testnt",
    "port": 5432
  }

  const instFunction = new InstrumentedFunctionService(new PostgresDbService(testConfig))

  test("add two events", () => {
    const eventsToAdd: InstrumentedFunctionEvent[] = []

    eventsToAdd.push({
      file: "file",
      function: "function",
      line: 0,
      timestamp: Date.now(),
      type: "variable",
      value: 7
    })

    eventsToAdd.push({
      file: "file",
      function: "function2",
      line: 1,
      timestamp: Date.now(),
      type: "exception",
      value: 7,
      other: {"errore": 1}
    })
    let ids = []
    instFunction.bulkSave(eventsToAdd).then(id => ids = id)
  })
})