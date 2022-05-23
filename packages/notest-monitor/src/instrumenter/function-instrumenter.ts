import {FunctionDeclaration, Project, SourceFile} from "ts-morph";
import {ImportInstrumenter} from "./instrumenter-utils/import-instrumenter";
import {InstrumenterUtils} from "./instrumenter-utils/instrumenter.utils";
import {instrumentationRules, relativePathForCollectorMap} from "@butopen/notest-collector"

export class FunctionInstrumenter {
  private project: Project;

  constructor(project: Project) {
    this.project = project
  }

  instrumentFileFunctions(path: string) {
    const functions = this.project.getSourceFileOrThrow(path).getFunctions()
    let functionsInstrumentedSourceFiles: SourceFile[] = []
    functions.forEach(func => {
      functionsInstrumentedSourceFiles.push(this.instrument(path, func.getNameOrThrow()))
    })
    this.project.saveSync()
    return functionsInstrumentedSourceFiles
  }

  instrument(sourceFilePath: string, functionName: string) {
    const instrumenterUtils = new InstrumenterUtils("function")
    console.log("instrumenting " + functionName)
    const {
      sourceFile,
      sourceFunction,
      wrapFile,
      wrapFunction,
      instrumentFunction
    } = this.initialize(sourceFilePath, functionName)

    const importInstrumenter = new ImportInstrumenter()

    importInstrumenter.addImportsWrapFile(sourceFile, wrapFile)

    // Add body
    if (sourceFunction.getBodyText()) {
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    } else throw new Error("Function hasn't body")

    instrumenterUtils.instrumentBody(wrapFunction, sourceFilePath, functionName)
    instrumenterUtils.setParametersCollectors(sourceFunction, wrapFunction, functionName)
    instrumenterUtils.addFullTextCollector(wrapFunction, functionName, sourceFunction.getFullText(), sourceFilePath)
    instrumenterUtils.wrapInTryCatch(wrapFunction, sourceFilePath, functionName)
    instrumenterUtils.addCheckFunctionInInstrumentedFunctionFile(wrapFile, sourceFunction)
    this.addIfOnSourceFile(sourceFile, sourceFunction)

    const nameFunctionToImport = instrumentFunction.getName()
    importInstrumenter.addImportsSourceFile(sourceFile, nameFunctionToImport, sourceFunction.getName())

    instrumentFunction.getBody()!
      .replaceWithText(writer => writer.writeLine(`{return ${wrapFunction.getFullText()}}`))

    instrumenterUtils.handleInFileFunctions(sourceFile, wrapFile)
    instrumentationRules.updateMapRules({
      path: relativePathForCollectorMap(sourceFile.getFilePath().slice(0, -3)),
      name: sourceFile.getBaseName()
    }, true)
    wrapFile.organizeImports()
    wrapFile.formatText()
    this.project.saveSync()
    console.log("ended")
    return wrapFile
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)

    let wrapFunctionName = 'instrument_' + functionName

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`

    let wrapFile = this.project.getSourceFile(pathWrapFile)
    let wrapFunction: FunctionDeclaration | undefined
    if (!wrapFile) {
      wrapFile = this.project.createSourceFile(pathWrapFile)
    } else {
      if (wrapFile.getFunction(wrapFunctionName)) {
        wrapFile.getFunction(wrapFunctionName)!.remove()
        wrapFile.organizeImports()
      }
    }

    const instrumentFunction = wrapFile.addFunction({
      name: wrapFunctionName,
      isExported: true,
      isAsync: sourceFunction.isAsync()
    })
    wrapFunction = instrumentFunction.addFunction({name: 'instrumentation', isAsync: sourceFunction.isAsync()})
    this.cleanOnInit(sourceFunction, sourceFile, functionName, wrapFile)
    return {sourceFile, sourceFunction, wrapFile, wrapFunction, instrumentFunction}
  }

  private addIfOnSourceFile(sourceFile: SourceFile, sourceFunction) {
    const handleAsync: string = sourceFunction.isAsync() ? "await" : ""

    sourceFile.addStatements(writer =>
      writer.writeLine(`/* decorated by notest... just ignore -> */if(useInstrumented_${sourceFunction.getName()}()){/*@ts-ignore*/ ${sourceFunction.getName()} = ${handleAsync} instrument_${sourceFunction.getName()}()}`))
  }

  private cleanOnInit(sourceFunction: FunctionDeclaration, sourceFile: SourceFile, functionName: string, wrapFile: SourceFile) {
    sourceFile
      .getStatements()
      .filter((statement) => statement.getText().includes(`useInstrumented_${functionName}()`))
      .forEach((statement) => statement.remove())
    sourceFile.getImportDeclarations().forEach(imp => {
      if (imp.getImportClause()) {
        if (imp.getImportClause()!.getText().includes(`instrument_${functionName}`) || imp.getImportClause()!.getText().includes(`useInstrumented_${functionName}`)) {
          imp.getImportClause()!.getNamedImports().forEach(name => {
            if (name.getText() == `instrument_${functionName}` || name.getText() == `useInstrumented_${functionName}`)
              name.remove()
          })
          if (!imp.getImportClause()) {
            imp.remove()
          }
        }
      }
    })

    const functionToDelete = wrapFile.getFunction(`useInstrumented_${functionName}`)
    if (functionToDelete) {
      functionToDelete.remove()
    }
  }
}
