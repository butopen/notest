import {Injectable} from '@nestjs/common';
import {DB} from "../postgres/postgres-db.service";
import {InstrumentedEvent} from "@butopen/notest-model";
import {Project} from "ts-morph";
import {giveParamsAndExpected, makeTitle} from "./test-generator.utils";

@Injectable()
export class TestGeneratorService {
  constructor(private db: DB) {
  }

  async getInfoFromDb(instruction: { scriptType: string; filePath: string; functionName: string; }) {
    const response = await this.db.query(`select * from instrumentedEvent 
                      where scripttype = '${instruction.scriptType}'
                            and filepath = '${instruction.filePath}'
                            and functionname = '${instruction.functionName}'
                      order by fired,line`);
    const variables: InstrumentedEvent[] = response.map(elem => {
      return {
        script: elem['scripttype'],
        type: elem['nttype'],
        value: elem['value']['content'],
        line: elem['line'],
        function: elem['functionname'],
        file: elem['filepath'],
        timestamp: elem['fired'],
        other: elem['other']
      }
    })

    let routineList: { routine: InstrumentedEvent[] }[] = [];
    let routineBuffer: InstrumentedEvent[] = [];
    for (const variable of variables) {
      if (variable.type == 'text') {
        routineList.push({routine: routineBuffer.splice(0)})
      }
      routineBuffer.push(variable)
    }
    if (response.length) {
      return {
        scriptType: response[0]['scripttype'],
        scriptData: routineList
      }
    } else {
      return {
        scriptType: '',
        scriptData: routineList
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
