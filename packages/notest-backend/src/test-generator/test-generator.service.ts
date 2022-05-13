import {Injectable} from '@nestjs/common';
import {DB} from "../postgres/postgres-db.service";
import {InstrumentedEvent} from "@butopen/notest-model";
import {Project} from "ts-morph";
import hash from "object-hash"

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
    const pathFileArray = routine[0].file.replace('\\', '/').split('/').pop()
    project.addSourceFileAtPathIfExists(pathFileArray.concat('/'))
    let testFile = project.getSourceFile(pathFileArray.concat('/') + '/test/test-' + functionName)
    if (!testFile) {
      testFile = project.createSourceFile(pathFileArray.concat('/') + '/test/test-' + functionName)
    }

    const input = routine.filter(element => element.type == 'input')
    const output = routine.filter(element => element.type == 'output')[0]
    const testTitle = hash(
      input
        .map(elem => elem.value)
        .reduce((elem1, elem2) => elem1.value.toString() + elem2.value.toString())
    )

    testFile.insertStatements(0, writer => {
      writer.write(`import {${functionName}} from '${routine[0].file}'`)
    })

    const params = input
      .map(elem => elem.value)
      .reduce((elem1, elem2) => elem1.value.toString() + ',' + elem2.value.toString());

    testFile.addStatements(writer => {
      writer.write(
        `test("${testTitle}", async () => {
                expect(${functionName}(${params})).toBe(${output.value})
              })`
      )
    })

    console.log("created test for " + functionName)
  }

  generateMethodTest(routine: InstrumentedEvent[]) {

  }
}
