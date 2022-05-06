import {FunctionDeclaration, MethodDeclaration, Node, SourceFile, SyntaxKind} from "ts-morph";
import {InstrumentStatementInterface} from "./statements-instrumenters/instrument-statement.interface";
import {VariableInstrumenter} from "./statements-instrumenters/variable-instrumenter";
import {ExpressionInstrumenter} from "./statements-instrumenters/expression-instrumenter";
import {ReturnInstrumenter} from "./statements-instrumenters/return-instrumenter";
import {collectorCreator, relativePathForCollectorMap} from "@butopen/notest-collector";

export class InstrumenterUtils {
  setParametersCollectors(sourceFunc: FunctionDeclaration | MethodDeclaration, wrapFunc: FunctionDeclaration, functionName: string) {
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
          functionName,
          sourceFunc.getSourceFile().getFilePath(),
          wrapFunc.getStartLineNumber())
      )
    })

    wrapFunc.addParameters(parameters)
  }

  wrapInTryCatch(wrapFunc: FunctionDeclaration, filePath: string, functionName: string) {
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
            functionName,
            filePath,
            wrapFunc.getStartLineNumber())
        )
        .write('}}')
    )
  }

  addCheckFunctionInInstrumentedFile(wrapFile: SourceFile, sourceFunction: FunctionDeclaration | MethodDeclaration) {
    const sourceFilePath = sourceFunction.getSourceFile().getFilePath().slice(0, -3)
    const functionName = sourceFunction.getName()
    const checkFunction = wrapFile.addFunction({name: `useInstrumented_${functionName}`, isExported: true})
    checkFunction.addStatements(`return instrumentationRules.check( {path: '${relativePathForCollectorMap(sourceFilePath)}', name: '${sourceFunction.getName()}'})`)
  }

  instrumentBody(wrapFunction: FunctionDeclaration, filePath: string, functionName: string) {
    wrapFunction.getChildren().forEach(
      child => this.instrumentStatementRec(child, filePath, functionName)
    )
  }

  instrumentStatementRec(node: Node, filepath: string, functionName: string) {
    node.getChildren().forEach(
      childStatement => this.instrumentStatementRec(childStatement, filepath, functionName))
    if (this.toBeInstrumented(node)) {
      const instrumenter: InstrumentStatementInterface = this.setKind(node)
      instrumenter.addCollector(node, filepath, functionName)
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