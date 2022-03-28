import {FunctionDeclaration, Node, Project, SourceFile, SyntaxKind, VariableStatement} from "ts-morph";
import {VariableInstrumenter} from "./statements-instrumenters/variable-instrumenter";
import {ExpressionInstrumenter} from "./statements-instrumenters/expression-instrumenter";
import {ReturnInstrumenter} from "./statements-instrumenters/return-instrumenter";
import {InstrumentStatementInterface} from "./statements-instrumenters/instrument-statement.interface";
import {collectorCreator} from "../../../notest-collector/src/collector-creator";
import * as path from "path";
import {ImportInstrumenter} from "./import-instrumenter";

export class FunctionInstrumenter {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  instrumentFileFunctions(path: string) {
    const functions = this.project.getSourceFileOrThrow(path).getFunctions()
    let functionsInsturmentedSourceFiles: SourceFile[] = []
    functions.forEach(func => {
      functionsInsturmentedSourceFiles.push(this.instrument(path, func.getNameOrThrow()))
    })
    this.project.saveSync()
    return functionsInsturmentedSourceFiles
  }

  instrument(sourceFilePath: string, functionName: string) {
    console.log("instrumenting " + functionName)
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)

    const importInstrumenter = new ImportInstrumenter()

    importInstrumenter.addImports(sourceFile, wrapFile, sourceFunction)
    importInstrumenter.destinationImportsChanger(sourceFunction, wrapFunction)

    // Add body
    if (sourceFunction.getBodyText()) {
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    } else throw new Error("Function hasn't body")

    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    this.setParametersCollectors(sourceFunction, wrapFunction)

    this.setFunctionOption(sourceFile, wrapFile, wrapFunction, sourceFunction)

    this.wrapInTryCatch(wrapFunction)

    wrapFile.organizeImports()
    wrapFile.formatText()
    this.project.saveSync()
    return wrapFile
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)
    let wrapFunctionName = functionName + 'InstrumentedImplementation'

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`

    let wrapFile = this.project.getSourceFile(pathWrapFile)
    let wrapFunction: FunctionDeclaration | undefined
    if (wrapFile) {
      wrapFunction = wrapFile.getFunction(wrapFunctionName)
      if (wrapFunction) {
        wrapFunction.remove()
        wrapFile.getFunctionOrThrow(`${functionName}ToReturn`).remove()
        let variableStat: VariableStatement[] = wrapFile.getStatements()
          .filter(stat => stat.getKind() == SyntaxKind.VariableStatement)
          .map(stat => stat.asKindOrThrow(SyntaxKind.VariableStatement))
          .filter(stat => stat.getDeclarations()[0].getName() == `${functionName}Instrumented`)
        variableStat.forEach(stat => stat.remove())
        console.log('Function deleted and recreated')
      }
    } else {
      wrapFile = this.project.createSourceFile(pathWrapFile)
    }
    wrapFunction = wrapFile.addFunction({name: wrapFunctionName, isExported: true})

    return {sourceFile, sourceFunction, wrapFile, wrapFunction}
  }

  private setParametersCollectors(func: FunctionDeclaration, wrapFunc: FunctionDeclaration) {
    const parameters: { name: string, type: string }[] = []

    func.getParameters().forEach(param => {
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

  private instrumentBody(wrapFunction: FunctionDeclaration) {
    wrapFunction.getChildren().forEach(
      child => this.instrumentStatementRec(wrapFunction, child)
    )
  }

  private instrumentStatementRec(wrapFunction: FunctionDeclaration, node: Node) {
    node.getChildren().forEach(
      childStatement => this.instrumentStatementRec(wrapFunction, childStatement))
    if (this.toBeInstrumented(node)) {
      const instrumenter: InstrumentStatementInterface = this.setKind(node)
      instrumenter.addCollector(node, wrapFunction)
    }
  }

  private toBeInstrumented(node: Node): Boolean {
    const statementsToInstrument = [SyntaxKind.VariableStatement, SyntaxKind.ExpressionStatement, SyntaxKind.ReturnStatement]
    return statementsToInstrument.includes(node.getKind())
  }

  private setKind(node: Node) {
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

  private setFunctionOption(sourceFile: SourceFile, wrapFile: SourceFile,
                            wrapFunction: FunctionDeclaration, sourceFunction: FunctionDeclaration) {

    const functionOption = wrapFile.addFunction({name: `${sourceFunction.getName()}ToReturn`})
    functionOption.addStatements(writer =>
      writer
        .write(`if (instrumentationRules.check(`)
        .write(`{path: '${relativePathForCollectorMap(sourceFile.getFilePath().slice(0, -3))}', name: '${sourceFunction.getName()}'}`)
        .write(`))`)
        .write(`return ${sourceFunction.getName()}Real`).newLine()
        .write('else').newLine()
        .write(`return ${wrapFunction.getName()}`))
    wrapFile.addStatements(`export const ${sourceFunction.getName()}Instrumented = ${sourceFunction.getName()}ToReturn()`)
  }

  private wrapInTryCatch(wrapFunc: FunctionDeclaration) {
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
}

export function relativePathForCollectorMap(pathAbs: string) {
  let relPath = path.relative(path.resolve("."), pathAbs).toString()
  return relPath.replace(/\\/g, '/')
}
