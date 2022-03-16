import {Expression, Statement, SyntaxKind, VariableStatement} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
import {InfoAdderForCollector} from "./info_adder_for_collector";

export class VariableInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement | Expression) {
    const variableStatement: VariableStatement = statement.asKindOrThrow(SyntaxKind.VariableStatement)
    variableStatement.getDeclarations().forEach(declaration => {
        statement.replaceWithText(writer =>
          writer
            .writeLine(statement.getFullText()).newLine()
            .write(`collector.collect(${InfoAdderForCollector.addInfo(declaration.getName(), "variable")})`)
        )
      }
    )
  }
}