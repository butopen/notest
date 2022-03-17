import {Expression, ExpressionStatement, Statement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
import {InfoAdderForCollector} from "./info_adder_for_collector";

export class ExpressionInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement | Expression) {
    const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
    const expression = expressionStatement.getExpression().getText(false)
    statement.replaceWithText(writer => {
        writer
          .writeLine(statement.getFullText()).newLine()
          .write(
            InfoAdderForCollector.addInfo(
              `'${expression}'`,
              "expression",
              expressionStatement.getStartLineNumber())
          )
        if (expressionStatement.getChildren()[0].getKind() == SyntaxKind.BinaryExpression) {
          const variableToCollect = expressionStatement.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText()
          writer.newLine()
            .write(
              InfoAdderForCollector.addInfo(
                variableToCollect,
                "variable",
                expressionStatement.getStartLineNumber())
            )
        }
      }
    )
  }
}
