import {FunctionDeclaration, Statement, SyntaxKind, VariableStatement} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument-statement.interface";
import {collectorCreator} from "@butopen/notest-collector";

export class VariableInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement, wrapFunction: FunctionDeclaration, functionName) {
    const variableStatement: VariableStatement = statement.asKindOrThrow(SyntaxKind.VariableStatement)
    variableStatement.getDeclarations().forEach(declaration => {
        if (declaration.getInitializer()) {
          statement.replaceWithText(writer =>
            writer
              .writeLine(statement.getFullText()).newLine()
              .write(
                collectorCreator.addInfo(
                  declaration.getName(),
                  "variable",
                  functionName,
                  wrapFunction.getSourceFile().getFilePath(),
                  variableStatement.getStartLineNumber())
              )
          )
        }
      }
    )
  }
}
