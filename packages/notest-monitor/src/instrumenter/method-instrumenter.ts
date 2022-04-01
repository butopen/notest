import {FunctionDeclaration, MethodDeclaration, Project, SourceFile} from "ts-morph";
import {ImportInstrumenter} from "./instrumenter-utils/import-instrumenter";
import {relativePathForCollectorMap} from "./function-instrumenter";
import {InsturmenterUtils} from "./instrumenter-utils/insturmenter.utils";

export class MethodInstrumenter {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  instrument(sourceFilePath: string, className: string, methodName: string) {
    const instrumenterUtils = new InsturmenterUtils()
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
    } else throw new Error("Function hasn't body")

    instrumenterUtils.instrumentBody(wrapFunction)

    // Instrument input parameters
    wrapFunction.addParameters([{name: 'this'}])
    instrumenterUtils.setParametersCollectors(sourceMethod, wrapFunction)

    instrumenterUtils.wrapInTryCatch(wrapFunction)

    this.addCallInSourceFile(sourceMethod, className, sourceFile)
    const nameFunctionToImport = 'instrument_' + sourceMethod.getName()
    importInstrumenter.addImportsSourceFile(sourceFile, nameFunctionToImport)
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
    let instrumentFunction: FunctionDeclaration | undefined

    if (!wrapFile) wrapFile = this.project.createSourceFile(pathWrapFile)
    else {
      instrumentFunction = wrapFile.getFunction(wrapFunctionName)
      if (instrumentFunction) instrumentFunction.remove()
    }
    instrumentFunction = wrapFile.addFunction({name: wrapFunctionName, isExported: true})
    instrumentFunction.addParameters([{name: className}])

    const wrapFunction = instrumentFunction.addFunction({name: undefined})

    const sourceMethod = sourceFile.getClassOrThrow(className).getMethodOrThrow(methodName)
    this.cleanOnInit(sourceFile, className, methodName)
    return {sourceFile, sourceMethod, wrapFile, wrapFunction, instrumentFunction}
  }


  private addCallInSourceFile(sourceMethod: MethodDeclaration, className: string, sourceFile: SourceFile) {
    const sourceFilePath = sourceFile.getFilePath().slice(0, -3)
    sourceFile.addStatements(`/* decorated by notest... just ignore -> */if( instrumentationRules.check( {path: '${relativePathForCollectorMap(sourceFilePath)}', name: '${sourceMethod.getName()}'})){instrument_${sourceMethod.getName()}(${className})}`)
  }

  private cleanOnInit(sourceFile: SourceFile, className: string, methodName: string) {
    sourceFile.getStatements().forEach(stat => {
      if (stat.getText().includes(`{instrument_${methodName}(${className})}`))
        stat.remove()
    })
    sourceFile.getImportDeclarations().forEach(imp => {
      if (imp.getFullText().includes('instrumentationRules')
        || imp.getFullText().includes(`instrumentation/${sourceFile.getBaseNameWithoutExtension()}`))
        imp.remove()
    })

  }
}
