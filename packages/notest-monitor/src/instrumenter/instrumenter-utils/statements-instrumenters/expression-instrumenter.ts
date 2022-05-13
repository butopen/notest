import {Expression, ExpressionStatement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument-statement.interface";
import {collectorCreator} from "@butopen/notest-collector";

export class ExpressionInstrumenter implements InstrumentStatementInterface {

  addCollector(script: string, statement: Expression, filePath: string, functionName) {
    const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
    statement.replaceWithText(writer => {
        writer.writeLine(statement.getFullText()).newLine()
        if (expressionStatement.getChildren()[0].getKind() == SyntaxKind.BinaryExpression) {
          const variableToCollect = expressionStatement.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText()
          writer.newLine()
            .write(
              collectorCreator.addInfo(
                script,
                variableToCollect,
                "expression",
                functionName,
                filePath,
                expressionStatement.getStartLineNumber())
            )
        }
      }
    )
  }
}
