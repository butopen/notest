import {Injectable} from '@nestjs/common';
import {DB} from "../postgres/postgres-db.service";
import {InstrumentedEvent} from "@butopen/notest-model";
import {Project} from "ts-morph";
import {giveParamsAndExpected, makeTitle} from "./test-generator.utils";

const objectHash = require("object-hash");

@Injectable()
export class TestGeneratorService {
  constructor(private readonly db: DB) {
  }

  async getInfoFromDb(instruction) {
    const response = await this.db.query(`select * from instrumentedEvent 
                      where scripttype == ${instruction.scriptType} 
                            and filepath == ${instruction.filePath} 
                            and functionname == ${instruction.functionName}
                      order by fired,line`);

    const variables: InstrumentedEvent[] = response.map(elem => {
      return {
        script: elem['scripttype'],
        type: elem['nttype'],
        value: elem['value'],
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
      routineBuffer.push(variable)
      if (variable.type == 'output') {
        routineList.push({routine: routineBuffer.splice(0)})
      }
    }
    return {
      scriptType: response[0]['scripttype'],
      scriptData: routineList
    }
  }

  async generateFunctionTest(routine: InstrumentedEvent[]) {

    const project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });

    const functionName = routine[0].function;
    const pathFile = routine[0].file.replace('\\', '/').split('/').slice(0, -1).join('/')
    let testFile = project.getSourceFile(pathFile + '/test/test-' + functionName + ".ts")
    if (!testFile) {
      testFile = project.createSourceFile(pathFile + '/test/test-' + functionName + '.ts')
    }

    const inputs = routine.filter(element => element.type == 'input')
    const output = routine.filter(element => element.type == 'output')[0]
    const testTitle = makeTitle(inputs)
    const importStatement = `import {${functionName}} from '${routine[0].file.slice(0, -3)}'`
    let {params, returnValue} = giveParamsAndExpected(inputs, output)

    let testFunction = `test("${testTitle}", async () => {\n`
    testFunction += ` expect(${functionName}(${params.substring(1)})).toBe(${returnValue})\n})`

    testFile.insertStatements(0, importStatement)
    testFile.addStatements(testFunction)
    testFile.organizeImports()
    project.saveSync()

    console.log("created test for " + functionName)

    return testFile.getText()
  }

  generateMethodTest(routine: InstrumentedEvent[]) {

  }
}
