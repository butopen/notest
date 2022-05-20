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
    const {sourceFile, sourceFunction, wrapFile, wrapFunction} = this.initialize(sourceFilePath, functionName)

    const importInstrumenter = new ImportInstrumenter()

    importInstrumenter.addImportsWrapFile(sourceFile, wrapFile)

    // Add body
    if (sourceFunction.getBodyText()) {
      wrapFunction.addStatements(sourceFunction.getBodyText()!)
    } else throw new Error("Function hasn't body")

    instrumenterUtils.instrumentBody(wrapFunction, sourceFilePath, functionName)

    // Instrument input parameters
    instrumenterUtils.setParametersCollectors(sourceFunction, wrapFunction, functionName)

    instrumenterUtils.wrapInTryCatch(wrapFunction, sourceFilePath, functionName)

    instrumenterUtils.addCheckFunctionInInstrumentedFunctionFile(wrapFile, sourceFunction)
    this.addIfOnSourceFile(sourceFunction)

    const nameFunctionToImport = wrapFunction.getName()
    importInstrumenter.addImportsSourceFile(sourceFile, nameFunctionToImport, sourceFunction.getName())

    instrumenterUtils.handleInFileFunctions(sourceFile, wrapFile)
    instrumentationRules.updateMapRules({
      path: relativePathForCollectorMap(sourceFile.getFilePath().slice(0, -3)),
      name: sourceFile.getBaseName()
    })
    wrapFile.organizeImports()
    wrapFile.formatText()
    this.project.saveSync()
    return wrapFile
  }

  private initialize(sourceFilePath: string, functionName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const sourceFunction = sourceFile.getFunctionOrThrow(functionName)

    let wrapFunctionName = functionName + 'Instrumented'

    const pathWrapFile = `${sourceFile.getDirectoryPath()}/instrumentation/${sourceFile.getBaseName()}`

    let wrapFile = this.project.getSourceFile(pathWrapFile)
    let wrapFunction: FunctionDeclaration | undefined
    if (!wrapFile) {
      wrapFile = this.project.createSourceFile(pathWrapFile)
    } else {
      wrapFunction = wrapFile.getFunction(wrapFunctionName)
      if (wrapFunction) {
        wrapFunction.remove()
      }
    }

    wrapFunction = wrapFile.addFunction({name: wrapFunctionName, isExported: true, isAsync: sourceFunction.isAsync()})
    this.cleanOnInit(sourceFunction, sourceFile, functionName, wrapFile)
    return {sourceFile, sourceFunction, wrapFile, wrapFunction}
  }

  private addIfOnSourceFile(sourceFunction: FunctionDeclaration) {
    let parametersList: string[] = []
    sourceFunction.getParameters().forEach(par => {
      parametersList.push(par.getName())
    })
    const handleAsync: string = sourceFunction.isAsync() ? "await" : ""
    sourceFunction.insertStatements(0, writer =>
      writer.writeLine(`/* decorated by notest... just ignore -> */if(useInstrumented_${sourceFunction.getName()}()){return ${handleAsync} ${sourceFunction.getName()}Instrumented(${parametersList.join(',')})}`))
  }

  private cleanOnInit(sourceFunction: FunctionDeclaration, sourceFile: SourceFile, functionName: string, wrapFile: SourceFile) {
    if (sourceFunction.getStatements()[0]!.getText().includes('instrumentationRules')) {
      sourceFunction.removeStatement(0)
    }
    sourceFile.getImportDeclarations().forEach(imp => {
      if (imp.getImportClause()) {
        if (imp.getImportClause()!.getText().includes(`${functionName}Instrumented`) || imp.getImportClause()!.getText().includes(`useInstrumented_${functionName}`)) {
          imp.getImportClause()!.getNamedImports().forEach(name => {
            if (name.getText() == `${functionName}Instrumented` || name.getText() == `useInstrumented_${functionName}`)
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
