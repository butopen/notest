import {FunctionDeclaration, Node, Project, SourceFile, SyntaxKind} from "ts-morph";
import {VariableInstrumenter} from "./statements_instrumenters/variable_instrumenter";
import {ExpressionInstrumenter} from "./statements_instrumenters/expression_instrumenter";
import {ReturnInstrumenter} from "./statements_instrumenters/return_instrumenter";
import {InstrumentStatementInterface} from "./statements_instrumenters/instrument_statement.interface";
import {InfoAdderForCollector} from "./info_adder_for_collector";

export class FunctionInstrumenter {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  instrumentFileFunctions(path: string) {
    const functions = this.project.getSourceFileOrThrow(path).getFunctions()
    functions.forEach(func => this.instrument(path, func.getNameOrThrow()))
  }

  instrument(sourceFilePath: string, functionName: string) {
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)

    this.addImports(sourceFile, wrapFile, sourceFunction)

    // Add body
    if (sourceFunction.getBodyText())
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    else throw new Error("Function hasn't body")

    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    this.setParametersCollectors(sourceFunction, wrapFunction)

    this.setFunctionReturnOption(sourceFile, wrapFile, wrapFunction, sourceFunction)

    wrapFile.organizeImports()
    wrapFile.formatText()
    return wrapFile
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)
    functionName = functionName + 'Instrumented'

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`

    let wrapFile = this.project.getSourceFile(pathWrapFile)

    if (!wrapFile)
      wrapFile = this.project.createSourceFile(pathWrapFile)

    if (wrapFile.getFunction(functionName)) {
      throw new Error('Exit because function already exist case not handled (Work in progress)')
    }

    const wrapFunction = wrapFile.addFunction({name: functionName, isExported: true})
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
        InfoAdderForCollector.addInfo(
          param.getName(),
          'input',
          wrapFunc.getName()!,
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

  private addImports(sourceFile: SourceFile, wrapFile: SourceFile, sourceFunction: FunctionDeclaration) {
    sourceFile.getImportDeclarations().forEach(imp => {
      wrapFile.insertStatements(0, imp.getFullText())
    })
    wrapFile.insertStatements(0, writer =>
      writer
        .write(`import collector from '@butopen/notest-collector/dist'`).newLine()
        .write(`import CollectEvent from '@butopen/notest-collector/dist'`).newLine()
        .write(`import {instrumentationRules} from '../../src/function-wrapper/instrumentation-rules/instrumentation-rules'`).newLine()
        .write(`import {${sourceFunction.getName()} as ${sourceFunction.getName()}Real} from '${sourceFile.getFilePath().slice(0, -3)}'`))
  }

  private setFunctionReturnOption(sourceFile: SourceFile, wrapFile: SourceFile,
                                  wrapFunction: FunctionDeclaration, sourceFunction: FunctionDeclaration) {

    const functionOption = wrapFile.addFunction({name: "whatToReturn"})
    functionOption.addStatements(writer =>
      writer
        .write(`if (instrumentationRules.check(`)
        .write(`{path: '${sourceFile.getFilePath().slice(0, -3)}', name: '${sourceFunction.getName()}'}`)
        .write(`))`)
        .write(`return ${sourceFunction.getName()}Real`).newLine()
        .write('else').newLine()
        .write(`return ${wrapFunction.getName()}`))

    wrapFile.addStatements(`export const ${sourceFunction.getName()} = whatToReturn()`)
  }
}
