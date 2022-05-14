import {InstrumentedEvent} from "@butopen/notest-model/dist";
import {TestGeneratorService} from "../../src/test-generator/test-generator.service";
import {DBConfig, PostgresDbService} from "../../src/postgres/postgres-db.service";

describe("Test generation", () => {
  const testConfig: DBConfig = {
    "host": "localhost",
    "user": "postgres",
    "password": "password",
    "database": "testnt",
    "port": 5432
  }

  test("test on generation of tests", async () => {

    const testRoutine: InstrumentedEvent[] = []
    const testGenerator = new TestGeneratorService(new PostgresDbService(testConfig))
    testRoutine.push({
      script: "function",
      file: "path/testFile.ts",
      function: "testFunction",
      line: 0,
      timestamp: Date.now(),
      type: "input",
      value: {test: true}
    })

    testRoutine.push({
      script: "function",
      file: "path/testFile.ts",
      function: "testFunction",
      line: 0,
      timestamp: Date.now(),
      type: "input",
      value: 7
    })

    testRoutine.push({
      script: "function",
      file: "path/testFile.ts",
      function: "testFunction",
      line: 0,
      timestamp: Date.now(),
      type: "input",
      value: "input"
    })

    testRoutine.push({
      script: "function",
      file: "path/testFile.ts",
      function: "testFunction",
      line: 1,
      timestamp: Date.now(),
      type: "output",
      value: "output"
    })

    console.log(await testGenerator.generateFunctionTest(testRoutine))
  })
})
