import {
  FunctionDeclaration,
  Project, SyntaxKind
} from "ts-morph";

export class FunctionInstrumenter {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  instrument(sourceFilePath: string, functionName: string){
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)
    this.setParameters(sourceFunction, wrapFunction)
    sourceFunction.getStatements().forEach( statement => {
      switch (statement.getKind()) {
        case SyntaxKind.VariableStatement:
          // Instrument Variable Statement
          break
        case SyntaxKind.ReturnStatement:
          // Instrument Return Statement
          break
      }
    })
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

  private setParameters(func: FunctionDeclaration, wrapFunc: FunctionDeclaration){
    const parameters:{name:string, type:string}[] = []

    func.getParameters().forEach(param => {
      parameters.push({
        name: param.getName(),
        type: param.getType().getText()
      })
    })

    wrapFunc.addParameters(parameters)
    return parameters;
  }
}
