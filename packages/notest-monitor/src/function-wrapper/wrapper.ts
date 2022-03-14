import {
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  Project,
  ReturnStatement,
  Statement,
  SyntaxKind,
  VariableStatement
} from "ts-morph";

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
    wrapFunction.addStatements(sourceFunction.getBodyText()!)

    // Instrument input
    this.setParametersCollectors(sourceFunction, wrapFunction)

    // Instrument body
    this.instrumentBody(wrapFunction)

    wrapFile.organizeImports()
    wrapFile.formatText()
    wrapFile.saveSync()
    return wrapFunction
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`
    const wrapFile = this.project.createSourceFile(pathWrapFile)

    if (wrapFile.getFunction(functionName)) {
      throw new Error('Exit because case function already exist not handled (Work in progress)')
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
      wrapFunc.insertStatements(0, `collector.collect({ 
      timestamp: Date.now(),
      type: 'input',
      value: ${param.getName()} })`)
    })

    wrapFunc.addParameters(parameters)
    return parameters;
  }

  private instrumentBody(wrapFunction: FunctionDeclaration) {
    wrapFunction.getStatements().forEach(
      statement => this.instrumentStatementRec(wrapFunction, statement)
    )
  }

  
  private instrumentStatementRec(wrapFunction: FunctionDeclaration, statement: Statement | Expression) {
    if (statement.getKind() == SyntaxKind.VariableStatement) {
      const variableStatement: VariableStatement = statement.asKindOrThrow(SyntaxKind.VariableStatement)
      variableStatement.getDeclarations().forEach(declaration => {
          statement.replaceWithText(writer =>
            writer
              .writeLine(statement.getFullText()).newLine()
              .write(`collector.collect({
                        timestamp: Date.now(),
                        type: 'variable',
                        value: ${declaration.getName()}})`)
          )
        }
      )
    } else if (statement.getKind() == SyntaxKind.ExpressionStatement) {
      const expressionStatement: ExpressionStatement = statement.asKindOrThrow(SyntaxKind.ExpressionStatement)
      const variableToCollect = expressionStatement.getFirstDescendantByKind(SyntaxKind.Identifier)?.getText()
      statement.replaceWithText(writer =>
        writer
          .writeLine(statement.getFullText()).newLine()
          .write(`collector.collect({
                          timestamp: Date.now(),
                          type: 'variableReplace',
                          value: ${variableToCollect}})`)
      )
    } else if (statement.getKind() == SyntaxKind.ReturnStatement) {
      const returnStatement: ReturnStatement = statement.asKindOrThrow(SyntaxKind.ReturnStatement)
      returnStatement.replaceWithText(writer =>
        writer.writeLine(`const output = ${returnStatement.getExpression()?.getText()}`).newLine()
          .write(`collector.collect({
                          timestamp: Date.now(),
                          type: 'output',
                          value: output})`)
          .writeLine(`return output`)
      )
    } else {
      statement.getDescendantStatements().forEach(
        childStatement => this.instrumentStatementRec(wrapFunction, childStatement))
    }
  }
}
