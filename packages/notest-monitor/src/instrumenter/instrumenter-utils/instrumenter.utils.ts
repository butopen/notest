import {FunctionDeclaration, MethodDeclaration, Node, SourceFile, SyntaxKind} from "ts-morph";
import {InstrumentStatementInterface} from "./statements-instrumenters/instrument-statement.interface";
import {VariableInstrumenter} from "./statements-instrumenters/variable-instrumenter";
import {ExpressionInstrumenter} from "./statements-instrumenters/expression-instrumenter";
import {ReturnInstrumenter} from "./statements-instrumenters/return-instrumenter";
import {collectorCreator, relativePathForCollectorMap} from "@butopen/notest-collector";

export class InstrumenterUtils {
  private readonly type: string;

  constructor(type: string) {
    this.type = type;
  }

  setParametersCollectors(sourceScript: FunctionDeclaration | MethodDeclaration, wrapScript: FunctionDeclaration, scriptName: string) {
    const parameters: { name: string, type: string }[] = []

    sourceScript.getParameters().forEach(param => {
      parameters.push({
        name: param.getName(),
        type: param.getType().getText()
      })
      wrapScript.insertStatements(0,
        collectorCreator.addInfo(
          this.type,
          param.getName(),
          'input',
          scriptName,
          sourceScript.getSourceFile().getFilePath(),
          wrapScript.getStartLineNumber())
      )
    })

    wrapScript.addParameters(parameters)
  }

  wrapInTryCatch(wrapScript: FunctionDeclaration, filePath: string, scriptName: string) {
    wrapScript.getBody()!.replaceWithText(writer =>
      writer
        .write('{').newLine()
        .write('try {').newLine()
        .write(wrapScript.getBodyText()!)
        .write('} catch (error: any) {').newLine()
        .write(
          collectorCreator.addInfo(
            this.type,
            'error.message',
            'exception',
            scriptName,
            filePath,
            wrapScript.getStartLineNumber())
        ).newLine()
        .write('return error')
        .write('}}')
    )
  }

  addCheckFunctionInInstrumentedFunctionFile(wrapFile: SourceFile, sourceScript: FunctionDeclaration) {
    const sourceFilePath = sourceScript.getSourceFile().getFilePath().slice(0, -3)
    const functionName = sourceScript.getName()
    const checkFunction = wrapFile.addFunction({name: `useInstrumented_${functionName}`, isExported: true})
    checkFunction.addStatements(`return instrumentationRules.check( {path: '${relativePathForCollectorMap(sourceFilePath)}', name: '${sourceScript.getName()}'})`)
  }

  addCheckFunctionInInstrumentedMethodFile(wrapFile: SourceFile, sourceScript: MethodDeclaration, className: string) {
    const sourceFilePath = sourceScript.getSourceFile().getFilePath().slice(0, -3)
    const functionName = sourceScript.getName()
    const checkFunction = wrapFile.addFunction({name: `useInstrumented_${functionName}`, isExported: true})
    checkFunction.addStatements(`return instrumentationRules.check( {path: '${relativePathForCollectorMap(sourceFilePath)}', name: '${className + '.' + sourceScript.getName()}'})`)
  }

  instrumentBody(wrapScript: FunctionDeclaration, filePath: string, scriptName: string) {
    wrapScript.getChildren().forEach(
      child => this.instrumentStatementRec(child, filePath, scriptName)
    )
  }

  instrumentStatementRec(node: Node, filepath: string, scriptName: string) {
    node.getChildren().forEach(
      childStatement => this.instrumentStatementRec(childStatement, filepath, scriptName))
    if (this.toBeInstrumented(node)) {
      const instrumenter: InstrumentStatementInterface = this.setKind(node)
      instrumenter.addCollector(this.type, node, filepath, scriptName)
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

  handleInFileFunctions(sourceFile: SourceFile, wrapFile: SourceFile) {
    sourceFile.getFunctions().forEach(fun => {
      if (fun.isExported()) {
        wrapFile.insertStatements(0, `import {${fun.getName()}} from '../${sourceFile.getBaseNameWithoutExtension()}'`)
      } else {
        const functionInWrap = wrapFile.getFunction(fun.getName()!)
        if (functionInWrap) {
          functionInWrap.remove()
        }
        wrapFile.addStatements(fun.getFullText())
      }
    })


  }


}