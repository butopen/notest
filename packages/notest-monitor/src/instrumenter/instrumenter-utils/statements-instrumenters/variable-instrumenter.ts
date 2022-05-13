import {Statement, SyntaxKind, VariableStatement} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument-statement.interface";
import {collectorCreator} from "@butopen/notest-collector";

export class VariableInstrumenter implements InstrumentStatementInterface {

  addCollector(script: string, statement: Statement, filePath: string, functionName) {
    const variableStatement: VariableStatement = statement.asKindOrThrow(SyntaxKind.VariableStatement)
    variableStatement.getDeclarations().forEach(declaration => {
        if (declaration.getInitializer()) {
          statement.replaceWithText(writer =>
            writer
              .writeLine(statement.getFullText()).newLine()
              .write(
                collectorCreator.addInfo(
                  script,
                  declaration.getName(),
                  "variable",
                  functionName,
                  filePath,
                  variableStatement.getStartLineNumber())
              )
          )
        }
      }
    )
  }
}
