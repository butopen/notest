import {MethodDeclaration, Project, SourceFile} from "ts-morph";
import {ImportInstrumenter} from "./instrumenter-utils/import-instrumenter";
import {InstrumenterUtils} from "./instrumenter-utils/instrumenter.utils";
import {instrumentationRules, relativePathFromSource} from "@butopen/notest-collector"

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
    const instrumenterUtils = new InstrumenterUtils("method")
    console.log("instrumenting " + methodName)
    const {
      sourceFile,
      sourceMethod,
      wrapFile,
      wrapFunction,
      instrumentFunction,
      instrumentLogicFile
    } = this.initialize(sourceFilePath, className, methodName)

    const importInstrumenter = new ImportInstrumenter()

    importInstrumenter.addImportsWrapFile(sourceFile, wrapFile)

    // Add body
    if (sourceMethod.getBodyText()) {
      wrapFunction.addStatements(sourceMethod.getBodyText()!)
    } else {
      throw new Error("Function hasn't body")
    }

    instrumenterUtils.instrumentBody(wrapFunction, sourceFilePath, methodName)

    // Instrument input parameters
    wrapFunction.addParameters([{name: 'this'}])
    instrumenterUtils.setParametersCollectors(sourceMethod, wrapFunction, methodName)
    instrumenterUtils.addFullTextCollector(wrapFunction, methodName, sourceMethod.getFullText(), sourceFilePath)
    instrumenterUtils.wrapInTryCatch(wrapFunction, sourceFilePath, methodName)
    instrumenterUtils.addCheckFunctionInInstrumentedMethodFile(wrapFile, sourceMethod, className)
    this.addCallInLogicFile(sourceMethod, className, instrumentLogicFile)
    const nameFunctionToImport = 'instrument_' + sourceMethod.getName()
    importInstrumenter.addInstrumentationImportsMethod(sourceFile, instrumentLogicFile, wrapFile, nameFunctionToImport, sourceMethod.getName(), className)
    const handleAsync = sourceMethod.isAsync() ? "async" : ""
    instrumentFunction.getBody()!
      .replaceWithText(`{${className}.prototype.${methodName} = ${handleAsync} ${wrapFunction.getText()}}`)

    instrumenterUtils.handleInFileFunctions(sourceFile, wrapFile)
    instrumentationRules.updateMapRules({
      path: relativePathFromSource(sourceFile.getFilePath().slice(0, -3)),
      name: className + '.' + methodName
    }, true)
    wrapFile.organizeImports()
    wrapFile.formatText()
    this.project.saveSync()
    console.log("done")
    return wrapFile
  }

  private initialize(sourceFilePath: string, className: string, methodName: string) {
    let instrumentLogicFile = this.project.getSourceFile(process.cwd() + '/src/instrumentLogic.ts')
    if (!instrumentLogicFile) {
      instrumentLogicFile = this.project.createSourceFile(process.cwd() + '/src/instrumentLogic.ts')
    }

    const sourceFile = this.project.getSourceFileOrThrow(sourceFilePath)
    const pathWrapFile = sourceFile.getDirectoryPath() + '/instrumentation/' + sourceFile.getBaseName()
    const wrapFunctionName = 'instrument_' + methodName
    let wrapFile = this.project.getSourceFile(pathWrapFile)

    if (!wrapFile) {
      wrapFile = this.project.createSourceFile(pathWrapFile)
    } else {
      if (wrapFile.getFunction(wrapFunctionName)) {
        wrapFile.getFunction(wrapFunctionName)!.remove()
        wrapFile.organizeImports()
      }
    }
    let instrumentFunction = wrapFile.addFunction({name: wrapFunctionName, isExported: true})
    instrumentFunction.addParameters([{name: className}])

    const wrapFunction = instrumentFunction.addFunction({name: undefined})
    const sourceMethod = sourceFile.getClassOrThrow(className).getMethodOrThrow(methodName)
    this.cleanOnInit(className, methodName, wrapFile, instrumentLogicFile)
    return {sourceFile, sourceMethod, wrapFile, wrapFunction, instrumentFunction, instrumentLogicFile}
  }


  private addCallInLogicFile(sourceMethod: MethodDeclaration, className: string, logicFile: SourceFile) {
    logicFile.addStatements(`/* decorated by notest... just ignore -> */if(useInstrumented_${sourceMethod.getName()}()){instrument_${sourceMethod.getName()}(${className})}`)
  }

  private cleanOnInit(className: string, methodName: string, wrapFile: SourceFile, instrumentedLogicFile: SourceFile) {
    instrumentedLogicFile.getStatements().forEach(stat => {
      if (stat.getText().includes(`{instrument_${methodName}(${className})}`) || stat.getText().includes(`{${className}}`)) {
        stat.remove()
      }
    })
    instrumentedLogicFile.getImportDeclarations().forEach(imp => {
      if (imp.getImportClause()) {
        if (imp.getImportClause()!.getText().includes(`instrument_${methodName}`) || imp.getImportClause()!.getText().includes(`useInstrumented_${methodName}`)) {
          imp.getImportClause()!.getNamedImports().forEach(name => {
            if (name.getText() == `instrument_${methodName}` || name.getText() == `useInstrumented_${methodName}`)
              name.remove()
          })
          if (!imp.getImportClause()) {
            imp.remove()
          }
        }
      }
    })

    const functionToDelete = wrapFile.getFunction(`useInstrumented_${methodName}`)
    if (functionToDelete) {
      functionToDelete.remove()
    }
  }
}
