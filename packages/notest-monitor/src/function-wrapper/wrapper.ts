import {
  FunctionDeclaration,
  Project, SyntaxKind
} from "ts-morph";

import * as fs from "fs"

export class Wrapper{

  wrap_function(pathSourceFile: string, nameFunction: string) {

    const project = new Project();

    project.addSourceFilesAtPaths('test/**/*.ts');
    if(!fs.existsSync(pathSourceFile))
      throw new Error("file does not exist")
    const sourceFile = project.getSourceFile(pathSourceFile)!

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`
    console.log(pathWrapFile)
    let wrapFile = project.getSourceFile(pathWrapFile)


    if (!wrapFile) {
      console.log("source not found, creating in " + pathWrapFile)
      wrapFile = project.createSourceFile(pathWrapFile)
    }

    // Da gestire caso in cui la funzione esiste già
    if(wrapFile.getFunction(nameFunction)){
      console.log("Already Exists, update?")
      return 0;
    }

    const func = sourceFile.getFunction(nameFunction)
    if(!func)
      throw new Error("Function does not exist")
    const wrapFunc = wrapFile.addFunction({name: nameFunction, isExported: true})

    // Aggiunta import
    wrapFile.addImportDeclaration({
      namedImports: [{
        name: nameFunction,
        alias: nameFunction + "_real"}],
      moduleSpecifier: '../' + sourceFile.getBaseNameWithoutExtension(),
    })

    const parameters = this.setParameters(func, wrapFunc)
    this.setInputCatcher(wrapFunc, parameters)
    this.setCallFunction(nameFunction, wrapFunc, parameters)
    Wrapper.setOutputCatcher(wrapFunc)
    if(func.getReturnType().getText() != 'void'){
      Wrapper.setReturn(wrapFunc)
    }

    project.save().then(_ => console.log("Save complete"))
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

  private setInputCatcher(wrapFunc: FunctionDeclaration, parameters) {
    parameters.forEach(param => {
      wrapFunc.addStatements(writer => {
        writer.writeLine(`send({ input: ${param.name} })`)
      })
    })
  }

  private setCallFunction(nameFunction: string, wrapFunc: FunctionDeclaration, parameters) {
    let vars: string = '';
    parameters.forEach(param => {
      vars += param.name + ','
    })
    vars = vars.slice(0,-1)

    wrapFunc.addStatements(writer => {
      writer.writeLine(`let output = ${nameFunction}_real(${vars})`)
    })
  }

  private static setOutputCatcher(wrapFunc: FunctionDeclaration) {
    wrapFunc.addStatements('send({ output: output })')
  }

  private static setReturn(wrapFunc: FunctionDeclaration) {
    wrapFunc.addStatements('return output')
  }
}

export class FunctionInstrumenter{
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
