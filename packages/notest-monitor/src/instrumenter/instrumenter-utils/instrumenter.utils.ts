import {FunctionDeclaration, MethodDeclaration, Node, SyntaxKind} from "ts-morph";
import {InstrumentStatementInterface} from "./statements-instrumenters/instrument-statement.interface";
import {VariableInstrumenter} from "./statements-instrumenters/variable-instrumenter";
import {ExpressionInstrumenter} from "./statements-instrumenters/expression-instrumenter";
import {ReturnInstrumenter} from "./statements-instrumenters/return-instrumenter";
import {collectorCreator} from "../../../../notest-collector/src/collector-creator";

export class InstrumenterUtils {
  setParametersCollectors(sourceFunc: FunctionDeclaration | MethodDeclaration, wrapFunc: FunctionDeclaration) {
    const parameters: { name: string, type: string }[] = []

    sourceFunc.getParameters().forEach(param => {
      parameters.push({
        name: param.getName(),
        type: param.getType().getText()
      })
      wrapFunc.insertStatements(0,
        collectorCreator.addInfo(
          param.getName(),
          'input',
          wrapFunc.getName()!,
          wrapFunc.getSourceFile().getBaseName(),
          wrapFunc.getStartLineNumber())
      )
    })

    wrapFunc.addParameters(parameters)
  }

  wrapInTryCatch(wrapFunc: FunctionDeclaration) {
    wrapFunc.getBody()!.replaceWithText(writer =>
      writer
        .write('{').newLine()
        .write('try {').newLine()
        .write(wrapFunc.getBodyText()!)
        .write('} catch (error: any) {').newLine()
        .write(
          collectorCreator.addInfo(
            'error.message',
            'exception',
            wrapFunc.getName()!,
            wrapFunc.getSourceFile().getFilePath(),
            wrapFunc.getStartLineNumber())
        )
        .write('}}')
    )
  }

  instrumentBody(wrapFunction: FunctionDeclaration) {
    wrapFunction.getChildren().forEach(
      child => this.instrumentStatementRec(wrapFunction, child)
    )
  }

  instrumentStatementRec(wrapFunction: FunctionDeclaration, node: Node) {
    node.getChildren().forEach(
      childStatement => this.instrumentStatementRec(wrapFunction, childStatement))
    if (this.toBeInstrumented(node)) {
      const instrumenter: InstrumentStatementInterface = this.setKind(node)
      instrumenter.addCollector(node, wrapFunction)
    }
  }

  toBeInstrumented(node: Node): Boolean {
    const statementsToInstrument = [SyntaxKind.VariableStatement, SyntaxKind.ExpressionStatement, SyntaxKind.ReturnStatement]
    return statementsToInstrument.includes(node.getKind())
  }

  setKind(node: Node) {
    switch (node.getKind()) {
      case SyntaxKind.VariableStatement:
        return new VariableInstrumenter()
      case SyntaxKind.ExpressionStatement:
        return new ExpressionInstrumenter()
      case SyntaxKind.ReturnStatement:
        return new ReturnInstrumenter()
      default:
        throw new Error("Not Provided")
    }
  }

}