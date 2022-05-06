import {ReturnStatement, Statement, SyntaxKind} from "ts-morph"
import {InstrumentStatementInterface} from "./instrument-statement.interface";
import {collectorCreator} from "@butopen/notest-collector";

export class ReturnInstrumenter implements InstrumentStatementInterface {

  addCollector(statement: Statement, filePath: string, functionName) {
    const returnStatement: ReturnStatement = statement.asKindOrThrow(SyntaxKind.ReturnStatement)
    const output = returnStatement.getExpressionOrThrow().getText()
    returnStatement.replaceWithText(writer =>
      writer
        .writeLine(`const output = ${output}`).newLine()
        .write(
          collectorCreator.addInfo(
            'output',
            "output",
            functionName,
            filePath,
            returnStatement.getStartLineNumber()))
        .writeLine(`return output`)
    )
  }
}
