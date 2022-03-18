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

    this.addImports(sourceFile, wrapFile)

    // Add body
    if (sourceFunction.getBodyText())
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    else throw new Error("Function hasn't body")

    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    this.setParametersCollectors(sourceFunction, wrapFunction)

    this.handleWrapperBoundDeclarations(wrapFunction)

    wrapFile.organizeImports()
    wrapFile.formatText()
    return wrapFile
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)

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

  private handleWrapperBoundDeclarations(wrapFunction: FunctionDeclaration) {
    // Add constant for collector (after all to not instrument it)
    wrapFunction.insertStatements(0, `const eventsToCollect: CollectEvent[] = []`)

    // Handle case of function without statement
    if (!wrapFunction.getDescendantsOfKind(SyntaxKind.ReturnStatement).length)
      wrapFunction.addStatements('collector.collect(eventsToCollect)')
  }

  private addImports(sourceFile: SourceFile, wrapFile: SourceFile) {
    sourceFile.getImportDeclarations().forEach(imp => {
      wrapFile.insertStatements(0, imp.getFullText())
    })
    wrapFile.insertStatements(0, writer =>
      writer.write(`import collector from '@butopen/notest-collector/dist'`).newLine()
        .write(`import CollectEvent from '@butopen/notest-collector/dist'`))
  }
}
