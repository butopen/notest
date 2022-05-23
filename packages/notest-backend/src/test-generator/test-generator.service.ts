import {Injectable} from '@nestjs/common';
import {DB} from "../postgres/postgres-db.service";
import {InstrumentedEvent} from "@butopen/notest-model";
import {Project} from "ts-morph";
import {giveParamsAndExpected, makeTitle} from "./test-generator.utils";
import {DbEventApiService} from "../db-event-api/db-event-api.service";

@Injectable()
export class TestGeneratorService {
  constructor(private db: DB, private dbEventApi: DbEventApiService) {
  }

  async getRoutines(request: { scriptType: string; filePath: string; functionName: string; }) {
    const variables: InstrumentedEvent[] = await this.dbEventApi.getAllRoutinesFromDb(request)
    let routines: { routine: InstrumentedEvent[] }[] = [];
    let routineBuffer: InstrumentedEvent[] = [];
    for (const variable of variables) {
      if (variable.type == 'text') {
        let routine = routineBuffer.splice(0)
        if (routine.length) {
          routines.push({routine: routine})
        }
      }
      routineBuffer.push(variable)
    }
    routines.push({routine: routineBuffer.splice(0)})
    if (variables.length) {
      return {
        scriptType: variables[0].script,
        scriptData: routines
      }
    } else {
      return {
        scriptType: '',
        scriptData: routines
      }
    }
  }

  async generateFunctionTest(routine: InstrumentedEvent[], project: Project) {

    const functionName = routine[0].function;
    const pathFile = routine[0].file.replace('\\', '/').split('/').slice(0, -1).join('/')
    let testFile = project.getSourceFile(pathFile + '/test/test-' + functionName + ".ts")
    if (!testFile) {
      testFile = project.createSourceFile(pathFile + '/test/test-' + functionName + '.ts')
    }

    const inputs = routine.filter(element => element.type == 'input')
    const output = routine.filter(element => element.type == 'output')[0]
    const testTitle = makeTitle(inputs, output)
    const importStatement = `import {${functionName}} from '${routine[0].file.slice(0, -3)}'`
    let {params, returnValue} = giveParamsAndExpected(inputs, output)

    let testFunction = `test("${testTitle}", async () => {\n`
    testFunction += ` expect(${functionName}(${params})).toBe(${returnValue})\n})`

    testFile.insertStatements(0, importStatement)
    testFile.addStatements(testFunction)
    testFile.organizeImports()
    project.saveSync()

    console.log("created test for function: " + functionName)

    return testFile.getText()
  }

  async generateMethodTest(routine: InstrumentedEvent[], project: Project) {
    const className = routine[0].function.split('.')[0]
    const methodName = routine[0].function.split('.')[1]
    const pathFile = routine[0].file.replace('\\', '/').split('/').slice(0, -1).join('/')

    let testFile = project.getSourceFile(pathFile + '/test/test-' + className + "-" + methodName + ".ts")
    if (!testFile) {
      testFile = project.createSourceFile(pathFile + '/test/test-' + className + "-" + methodName + ".ts")
    }

    const inputs = routine.filter(element => element.type == 'input')
    const output = routine.filter(element => element.type == 'output')[0]

    const testTitle = makeTitle(inputs, output)
    const importStatement = `import {${className}} from '${routine[0].file.slice(0, -3)}'`
    let {params, returnValue} = giveParamsAndExpected(inputs, output)

    let testFunction = `test("${testTitle}", async () => {\n`
    testFunction += ` expect(new ${className}.${methodName}(${params})).toBe(${returnValue})\n})`

    testFile.insertStatements(0, importStatement)
    testFile.addStatements(testFunction)
    testFile.organizeImports()
    project.saveSync()

    console.log("created test for method: " + className + "." + methodName)
  }
}
