import {Expression, ReturnStatement, Statement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";

export class ReturnInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement | Expression) {
    const returnStatement: ReturnStatement = statement.asKindOrThrow(SyntaxKind.ReturnStatement)
    returnStatement.replaceWithText(writer =>
      writer.writeLine(`const output = ${returnStatement.getExpression()?.getText()}`).newLine()
        .write(`collector.collect({
                          timestamp: Date.now(),
                          type: 'output',
                          value: output})`)
        .writeLine(`return output`)
    )
  }
}