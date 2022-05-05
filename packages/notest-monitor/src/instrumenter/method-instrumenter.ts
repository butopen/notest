import {FunctionDeclaration, MethodDeclaration, Project, SourceFile} from "ts-morph";
import {ImportInstrumenter} from "./instrumenter-utils/import-instrumenter";
import {InstrumenterUtils} from "./instrumenter-utils/instrumenter.utils";

export class MethodInstrumenter {
  private project: Project;

  constructor(project: Project) {
    this.project = project
  }

  instrumentFileMethods(path: string) {
    const classes = this.project.getSourceFileOrThrow(path).getClasses()
    classes.forEach(clas => {
      clas.getMethods().forEach(method => this.instrument(path, clas.getName()!, method.getName()))
    })
  }

  instrument(sourceFilePath: string, className: string, methodName: string) {
    const instrumenterUtils = new InstrumenterUtils()
    console.log("instrumenting " + methodName)
    const {
      sourceFile,
      sourceMethod,
      wrapFile,
      wrapFunction,
      instrumentFunction
    } = this.initialize(sourceFilePath, className, methodName)

    const importInstrumenter = new ImportInstrumenter()

    importInstrumenter.addImportsWrapFile(sourceFile, wrapFile)

    // Add body
    if (sourceMethod.getBodyText()) {
      wrapFunction.addStatements(sourceMethod.getBodyText()!)
    } else {
      throw new Error("Function hasn't body")
    }

    instrumenterUtils.instrumentBody(wrapFunction, methodName)

    // Instrument input parameters
    wrapFunction.addParameters([{name: 'this'}])
    instrumenterUtils.setParametersCollectors(sourceMethod, wrapFunction, methodName)

    instrumenterUtils.wrapInTryCatch(wrapFunction, methodName)
    instrumenterUtils.addCheckFunctionInInstrumentedFile(wrapFile, sourceMethod)
    this.addCallInSourceFile(sourceMethod, className, sourceFile)
    const nameFunctionToImport = 'instrument_' + sourceMethod.getName()
    importInstrumenter.addImportsSourceFile(sourceFile, nameFunctionToImport, sourceMethod.getName())

    instrumentFunction.getBody()!
      .replaceWithText(`{${className}.prototype.${methodName} = ${wrapFunction.getText()}}`)

    wrapFile.organizeImports()
    wrapFile.formatText()
    this.project.saveSync()
    return wrapFile
  }

  private initialize(sourceFilePath: string, className: string, methodName: string) {
    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const pathWrapFile = sourceFile.getDirectoryPath() + '/instrumentation/' + sourceFile.getBaseName()
    const wrapFunctionName = 'instrument_' + methodName
    let wrapFile = this.project.getSourceFile(pathWrapFile)
    let instrumentFunction: FunctionDeclaration

    if (!wrapFile) {
      wrapFile = this.project.createSourceFile(pathWrapFile)
    } else {
      if (wrapFile.getFunction(wrapFunctionName)) {
        wrapFile.getFunction(wrapFunctionName)!.remove()
        wrapFile.organizeImports()
      }
    }
    instrumentFunction = wrapFile.addFunction({name: wrapFunctionName, isExported: true})
    instrumentFunction.addParameters([{name: className}])

    const wrapFunction = instrumentFunction.addFunction({name: undefined})

    const sourceMethod = sourceFile.getClassOrThrow(className).getMethodOrThrow(methodName)
    this.cleanOnInit(sourceFile, className, methodName, wrapFile)
    return {sourceFile, sourceMethod, wrapFile, wrapFunction, instrumentFunction}
  }


  private addCallInSourceFile(sourceMethod: MethodDeclaration, className: string, sourceFile: SourceFile) {
    sourceFile.addStatements(`/* decorated by notest... just ignore -> */if(useInstrumented_${sourceMethod.getName()}()){instrument_${sourceMethod.getName()}(${className})}`)
  }

  private cleanOnInit(sourceFile: SourceFile, className: string, methodName: string, wrapFile: SourceFile) {
    sourceFile.getStatements().forEach(stat => {
      if (stat.getText().includes(`{instrument_${methodName}(${className})}`)) {
        stat.remove()
      }
    })
    sourceFile.getImportDeclarations().forEach(imp => {
      if (imp.getImportClause()) {
        if (imp.getImportClause()!.getText().includes(`instrument_${methodName}`)) {
          imp.getImportClause()!.getNamedImports().find(name => name.getText() == `instrument_${methodName}`)?.remove()
          if (!imp.getImportClause()) {
            imp.remove()
          }
        } else if (imp.getFullText().includes(`useInstrumented_${methodName}`)) {
          imp.remove()
        }
      }
    })

    const functionToDelete = wrapFile.getFunction(`useInstrumented_${methodName}`)
    if (functionToDelete) {
      functionToDelete.remove()
    }
  }
}
