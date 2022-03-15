import {Expression, ExpressionStatement, Statement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
export class ExpressionInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement | Expression) {
    const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
    const variableToCollect = expressionStatement.getFirstDescendantByKind(SyntaxKind.Identifier)?.getText()
    statement.replaceWithText(writer =>
      writer
        .writeLine(statement.getFullText()).newLine()
        .write(`collector.collect({
                          timestamp: Date.now(),
                          type: 'variableReplace',
                          value: ${variableToCollect}})`)
    )
  }
}
