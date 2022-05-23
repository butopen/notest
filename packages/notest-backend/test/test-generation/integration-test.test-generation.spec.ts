import {InstrumentedEvent} from "@butopen/notest-model/dist";
import {InstrumentedService} from "../../src/instrumentation/instrumented.service";
import {DBConfig, PostgresDbService} from "../../src/postgres/postgres-db.service";

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));

describe("Test add event to DB and generation test", () => {
  jest.setTimeout(10000)
  const testConfig: DBConfig = {
    "host": "localhost",
    "user": "postgres",
    "password": "password",
    "database": "testnt",
    "port": 5432
  }

  const db: PostgresDbService = new PostgresDbService(testConfig)

  beforeEach(() => {
    db.query(`delete from instrumentedevent`)
  })

  afterEach(() => {
    db.query(`delete from instrumentedevent`)
  })
  const instFunction = new InstrumentedService(db)

  test("add events and trigger test generation of function", async () => {
    const scriptType = "function"
    const filePath = "src/fileTest.ts"
    const functionName = "functionTest"
    const eventsToAdd = await createEvents(scriptType, filePath, functionName)
    await saveOnDbAndTriggerGeneration(scriptType, filePath, functionName, eventsToAdd)
  })

  test("add events and trigger test generation of methods", async () => {
    const scriptType = "method"
    const filePath = "src/fileTest.ts"
    const functionName = "classTest.methodTest"
    const eventsToAdd = await createEvents(scriptType, filePath, functionName)
    await saveOnDbAndTriggerGeneration(scriptType, filePath, functionName, eventsToAdd)
  })

  async function createEvents(scriptType, filePath, functionName) {
    await instFunction.generateTable();
    const eventsToAdd: InstrumentedEvent[] = []
    for (let i = 0; i <= 2; i++) {
      eventsToAdd.push({
        script: scriptType,
        file: filePath,
        function: functionName,
        line: 0,
        timestamp: i,
        type: "text",
        value: {content: "textofScript"}
      })

      eventsToAdd.push({
        script: scriptType,
        file: filePath,
        function: functionName,
        line: 1,
        timestamp: i,
        type: "input",
        value: {content: i}
      })

      eventsToAdd.push({
        script: scriptType,
        file: filePath,
        function: functionName,
        line: 2,
        timestamp: i,
        type: "output",
        value: {content: i + 1}
      })
    }
    return eventsToAdd
  }

  async function saveOnDbAndTriggerGeneration(scriptType, filePath, functionName, eventsToAdd) {
    let ids = []
    await instFunction.bulkSave(eventsToAdd).then(id => ids = id)
    console.log(ids.length)

    const rawResponse = await fetch("http://localhost:3000/test-generator/generate-test", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scriptType: scriptType,
        filePath: filePath,
        functionName: functionName,
      })
    });
    expect(rawResponse.ok).toBeTruthy()
  }
})