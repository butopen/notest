import {Expression, ExpressionStatement, FunctionDeclaration, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument_statement.interface";
import {InfoAdderForCollector} from "../info_adder_for_collector";

export class ExpressionInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Expression, wrapFunction: FunctionDeclaration) {
    const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
    statement.replaceWithText(writer => {
        writer.writeLine(statement.getFullText()).newLine()
        if (expressionStatement.getChildren()[0].getKind() == SyntaxKind.BinaryExpression) {
          const variableToCollect = expressionStatement.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText()
          writer.newLine()
            .write(
              InfoAdderForCollector.addInfo(
                variableToCollect,
                "variable",
                wrapFunction.getName()!,
                wrapFunction.getSourceFile().getBaseName(),
                expressionStatement.getStartLineNumber())
            )
        }
      }
    )
  }
}
