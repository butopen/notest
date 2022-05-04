import {Expression, ExpressionStatement, FunctionDeclaration, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument-statement.interface";
import {collectorCreator} from "@butopen/notest-collector";

export class ExpressionInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Expression, wrapFunction: FunctionDeclaration, functionName) {
    const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
    statement.replaceWithText(writer => {
        writer.writeLine(statement.getFullText()).newLine()
        if (expressionStatement.getChildren()[0].getKind() == SyntaxKind.BinaryExpression) {
          const variableToCollect = expressionStatement.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText()
          writer.newLine()
            .write(
              collectorCreator.addInfo(
                variableToCollect,
                "variable",
                functionName,
                wrapFunction.getSourceFile().getFilePath(),
                expressionStatement.getStartLineNumber())
            )
        }
      }
    )
  }
}
