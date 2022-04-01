import {FunctionDeclaration, Project, SourceFile} from "ts-morph";
import * as path from "path";
import {ImportInstrumenter} from "./instrumenter-utils/import-instrumenter";
import {InsturmenterUtils} from "./instrumenter-utils/insturmenter.utils";

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
    const instrumenterUtils = new InsturmenterUtils()
    console.log("instrumenting " + functionName)
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)

    const importInstrumenter = new ImportInstrumenter()

    importInstrumenter.addImportsWrapFile(sourceFile, wrapFile)

    // Add body
    if (sourceFunction.getBodyText()) {
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    } else throw new Error("Function hasn't body")

    instrumenterUtils.instrumentBody(wrapFunction)

    // Instrument input parameters
    instrumenterUtils.setParametersCollectors(sourceFunction, wrapFunction)

    instrumenterUtils.wrapInTryCatch(wrapFunction)

    this.addIfOnSourceFile(sourceFunction)

    const nameFunctionToImport = wrapFunction.getName()
    importInstrumenter.addImportsSourceFile(sourceFile, nameFunctionToImport)

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
    if (!wrapFile) wrapFile = this.project.createSourceFile(pathWrapFile)
    else {
      wrapFunction = wrapFile.getFunction(wrapFunctionName)
      if (wrapFunction) wrapFunction.remove()
    }

    wrapFunction = wrapFile.addFunction({name: wrapFunctionName, isExported: true})

    return {sourceFile, sourceFunction, wrapFile, wrapFunction}
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
    if (sourceFunction.getStatements()[0]!.getText().includes('instrumentationRules')) {
      sourceFunction.removeStatement(0)
    }
    sourceFile.getImportDeclarations().forEach(imp => {
      if (imp.getFullText().includes('instrumentationRules')
        || imp.getFullText().includes(`instrumentation/${sourceFile.getBaseNameWithoutExtension()}`))
        imp.remove()
    })
  }
}

export function relativePathForCollectorMap(pathAbs: string) {
  let relPath = path.relative(path.resolve("."), pathAbs).toString()
  return relPath.replace(/\\/g, '/')
}
