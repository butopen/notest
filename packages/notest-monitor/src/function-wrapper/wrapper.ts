import {FunctionDeclaration, Node, Project, SourceFile, SyntaxKind, VariableStatement} from "ts-morph";
import {VariableInstrumenter} from "./statements-instrumenters/variable-instrumenter";
import {ExpressionInstrumenter} from "./statements-instrumenters/expression-instrumenter";
import {ReturnInstrumenter} from "./statements-instrumenters/return-instrumenter";
import {InstrumentStatementInterface} from "./statements-instrumenters/instrument-statement.interface";
import {InfoAdderForCollector} from "./info-adder-for-collector";
import * as path from "path";

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
    console.log("instrumenting " + functionName)
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)

    this.addImports(sourceFile, wrapFile, sourceFunction)

    // Add body
    if (sourceFunction.getBodyText()) {
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    } else throw new Error("Function hasn't body")

    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    this.setParametersCollectors(sourceFunction, wrapFunction)

    this.setFunctionOption(sourceFile, wrapFile, wrapFunction, sourceFunction)

    this.wrapInTryCatch(wrapFunction)

    this.changeDestinationImports(sourceFunction)

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
        InfoAdderForCollector.addInfo(
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

  private addImports(sourceFile: SourceFile, wrapFile: SourceFile, sourceFunction: FunctionDeclaration) {
    sourceFile.getImportDeclarations().forEach(imp => {
      wrapFile.insertStatements(0, imp.getFullText())
    })
    wrapFile.insertStatements(0, writer =>
      writer
        .write(`import {InstrumentedFunctionEvent} from '@butopen/notest-model'`).newLine()
        .write(`import {collector, instrumentationRules} from '@butopen/notest-collector'`).newLine()
        .writeLine(`import {${sourceFunction.getName()} as ${sourceFunction.getName()}Real} from '../${sourceFile.getBaseNameWithoutExtension()}'`))
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
          InfoAdderForCollector.addInfo(
            'error.message',
            'exception',
            wrapFunc.getName()!,
            wrapFunc.getSourceFile().getFilePath(),
            wrapFunc.getStartLineNumber())
        )
        .write('}}')
    )
  }

  private changeDestinationImports(sourceFunction: FunctionDeclaration) {
    const sourceFunctionName = sourceFunction.getName()
    const sourceFileName = sourceFunction.getSourceFile().getBaseNameWithoutExtension()
    const externalReferences = sourceFunction.findReferences()
      .filter(ref => !(ref.getReferences()[0].getSourceFile().getBaseNameWithoutExtension() == sourceFileName))
    const externalReferencesSourceFile = externalReferences.map(ref => ref.getReferences()[0].getSourceFile())
    externalReferencesSourceFile.forEach(file => {
      let arrayImportRef = file.getImportDeclarations()
        .filter(imp =>
          imp.getModuleSpecifierValue()
            .replace(/\\/g, '/')
            .split('/').slice(-1)[0] == sourceFileName)
      if (arrayImportRef.length) {
        arrayImportRef.forEach(imp => {
          imp.getImportClause()!.replaceWithText(`{ ${sourceFunctionName}Instrumented as ${sourceFunctionName} }`)
          let arrayElementPath = imp.getModuleSpecifier()!
            .getText()
            .replace(/\\/g, '/')
            .split('/')
            .slice(0, -1)
          arrayElementPath.push(`instrumentation/${sourceFileName}`)
          let newPath = arrayElementPath.join('/')
          imp.getModuleSpecifier()!.replaceWithText(`'${newPath.slice(1)}'`)
        })
      } else {
        file.insertStatements(0, `import { ${sourceFunctionName}Instrumented as ${sourceFunctionName} } from './instrumentation/${sourceFunctionName}'`)
      }
    })
  }
}

export function relativePathForCollectorMap(pathAbs: string) {
  let relPath = path.relative(path.resolve("."), pathAbs).toString()
  return relPath.replace(/\\/g, '/')
}
