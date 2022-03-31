import {FunctionDeclaration, Node, Project, SourceFile, SyntaxKind} from "ts-morph";
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

    importInstrumenter.addImportsWrapFile(sourceFile, wrapFile)

    // Add body
    if (sourceFunction.getBodyText()) {
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    } else throw new Error("Function hasn't body")

    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    this.setParametersCollectors(sourceFunction, wrapFunction)

    this.wrapInTryCatch(wrapFunction)

    this.addIfOnSourceFile(sourceFunction)

    importInstrumenter.addImportsSourceFile(sourceFile, wrapFunction)

    wrapFile.organizeImports()
    wrapFile.formatText()
    this.project.saveSync()
    return wrapFile
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)

    this.cleanOnInit(sourceFunction, sourceFile)

    let wrapFunctionName = functionName + 'Instrumented'

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`

    let wrapFile = this.project.getSourceFile(pathWrapFile)
    let wrapFunction: FunctionDeclaration | undefined
    if (wrapFile) {
      wrapFunction = wrapFile.getFunction(wrapFunctionName)
      if (wrapFunction) {
        wrapFunction.remove()
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

  private addIfOnSourceFile(sourceFunction: FunctionDeclaration) {
    let parametersList: string[] = []
    sourceFunction.getParameters().forEach(par => {
      parametersList.push(par.getName())
    })
    const sourceFilePath = sourceFunction.getSourceFile().getFilePath().slice(0, -3)
    sourceFunction.insertStatements(0, writer =>
      writer.writeLine(`/* decorated by notest... just ignore -> */if( instrumentationRules.check( {path: '${relativePathForCollectorMap(sourceFilePath)}', name: '${sourceFunction.getName()}'})){return ${sourceFunction.getName()}Instrumented(${parametersList.join(',')})}`))
  }

  private cleanOnInit(sourceFunction: FunctionDeclaration, sourceFile: SourceFile) {
    if (sourceFunction.getStatements()[0]!.getText().includes('instrumentationRules'))
      sourceFunction.removeStatement(0)
    sourceFile.getImportDeclarations().forEach(imp => {
      if (imp.getFullText().includes('instrumentationRules'))
        imp.remove()
      else if (imp.getFullText().includes(`instrumentation/${sourceFile.getBaseNameWithoutExtension()}`))
        imp.remove()
    })

  }
}

export function relativePathForCollectorMap(pathAbs: string) {
  let relPath = path.relative(path.resolve("."), pathAbs).toString()
  return relPath.replace(/\\/g, '/')
}
