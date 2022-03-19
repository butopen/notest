import {FunctionDeclaration, Statement, SyntaxKind, VariableStatement} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
import {InfoAdderForCollector} from "../info_adder_for_collector";

export class VariableInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement, wrapFunction: FunctionDeclaration) {
    const variableStatement: VariableStatement = statement.asKindOrThrow(SyntaxKind.VariableStatement)
    variableStatement.getDeclarations().forEach(declaration => {
        statement.replaceWithText(writer =>
          writer
            .writeLine(statement.getFullText()).newLine()
            .write(
              InfoAdderForCollector.addInfo(
                declaration.getName(),
                "variable",
                wrapFunction.getName()!,
                wrapFunction.getSourceFile().getBaseName(),
                variableStatement.getStartLineNumber())
            )
        )
      }
    )
  }
}