import {InstrumentedEvent} from "@butopen/notest-model/dist";
import {InstrumentedService} from "../../src/instrumentation/instrumented.service";
import {DBConfig, PostgresDbService} from "../../src/postgres/postgres-db.service";

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));

describe("Test add event to DB and geneartion test", () => {
  const testConfig: DBConfig = {
    "host": "localhost",
    "user": "postgres",
    "password": "password",
    "database": "testnt",
    "port": 5432
  }
  const db: PostgresDbService = new PostgresDbService(testConfig)
  const instFunction = new InstrumentedService(db)

  test("add events and trigger test generation", async () => {
    await instFunction.generateTable();
    const eventsToAdd: InstrumentedEvent[] = []
    for (let i = 0; i <= 2; i++) {
      eventsToAdd.push({
        script: "function",
        file: "test/fileTest.ts",
        function: "functionTest",
        line: 0,
        timestamp: Date.now() + i,
        type: "input",
        value: i
      })

      eventsToAdd.push({
        script: "function",
        file: "test/fileTest.ts",
        function: "functionTest",
        line: 1,
        timestamp: Date.now() + i,
        type: "output",
        value: i + 1
      })
    }
    let ids = []
    await instFunction.bulkSave(eventsToAdd).then(id => ids = id)
    console.log(ids)

    const rawResponse = await fetch("http://localhost:3000/test-generator/generate-test", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scriptType: "function",
        filePath: "src/fileTest.ts",
        functionName: "functionTest"
      })
    });
    console.log(rawResponse.ok)
  })
})