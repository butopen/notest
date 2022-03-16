import {FunctionDeclaration, Node, Project, SyntaxKind} from "ts-morph";

import {VariableInstrumenter} from "./statements_instrumenters/variable_instrumenter";
import {ExpressionInstrumenter} from "./statements_instrumenters/expression_instrumenter";
import {ReturnInstrumenter} from "./statements_instrumenters/return_instrumenter";
import {InstrumentStatementInterface} from "./statements_instrumenters/instrument_statement.interface";
import {InfoAdderForCollector} from "./statements_instrumenters/info_adder_for_collector";

export class FunctionInstrumenter {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  instrument(sourceFilePath: string, functionName: string) {
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)

    // Add imports
    sourceFile.getImportDeclarations().forEach(imp => {
      wrapFile.insertStatements(0, imp.getFullText())
    })

    // Add body
    if (sourceFunction.getBodyText())
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    else throw new Error("Function hasn't body")

    // Instrument body
    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    this.setParametersCollectors(sourceFunction, wrapFunction)

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
    if (this.toBeInstrumented(node)) {
      const instrumenter: InstrumentStatementInterface = this.setKind(node)
      instrumenter.addCollector(node)
    } else {
      node.getChildren().forEach(
        childStatement => this.instrumentStatementRec(wrapFunction, childStatement))
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
}
