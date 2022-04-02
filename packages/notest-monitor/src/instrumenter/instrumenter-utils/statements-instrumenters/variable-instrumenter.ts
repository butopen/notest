import {FunctionDeclaration, Statement, SyntaxKind, VariableStatement} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument-statement.interface";
import {collectorCreator} from "../../../../../notest-collector/src/collector-creator";

export class VariableInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement, wrapFunction: FunctionDeclaration) {
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
                  wrapFunction.getName()!,
                  wrapFunction.getSourceFile().getFilePath(),
                  variableStatement.getStartLineNumber())
              )
          )
        }
      }
    )
  }
}
