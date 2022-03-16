import {Expression, ExpressionStatement, Statement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
import {InfoAdderForCollector} from "./info_adder_for_collector";

export class ExpressionInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement | Expression) {
    const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
    const variableToCollect = expressionStatement.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText()
    statement.replaceWithText(writer =>
      writer
        .writeLine(statement.getFullText()).newLine()
        .write(
          InfoAdderForCollector.addInfo(
            variableToCollect,
            "expression",
            expressionStatement.getStartLineNumber())
        )
    )
  }
}
