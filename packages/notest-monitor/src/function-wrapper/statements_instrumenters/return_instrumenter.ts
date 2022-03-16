import {Expression, ReturnStatement, Statement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
import {InfoAdderForCollector} from "./info_adder_for_collector";

export class ReturnInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement | Expression) {
    const returnStatement: ReturnStatement = statement.asKindOrThrow(SyntaxKind.ReturnStatement)
    const output = returnStatement.getExpressionOrThrow().getText()
    returnStatement.replaceWithText(writer =>
      writer
        .writeLine(`const output = ${output}`).newLine()
        .write(
          InfoAdderForCollector.addInfo(
            output,
            "output",
            returnStatement.getStartLineNumber())
        )
        .writeLine(`return output`)
    )
  }
}