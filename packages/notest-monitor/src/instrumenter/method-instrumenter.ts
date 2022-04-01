import {FunctionDeclaration, MethodDeclaration, Node, Project, SourceFile, SyntaxKind} from "ts-morph";
import {VariableInstrumenter} from "./instrumenter-utils/statements-instrumenters/variable-instrumenter";
import {ExpressionInstrumenter} from "./instrumenter-utils/statements-instrumenters/expression-instrumenter";
import {ReturnInstrumenter} from "./instrumenter-utils/statements-instrumenters/return-instrumenter";
import {
  InstrumentStatementInterface
} from "./instrumenter-utils/statements-instrumenters/instrument-statement.interface";
import {collectorCreator} from "../../../notest-collector/src/collector-creator";
import {ImportInstrumenter} from "./instrumenter-utils/import-instrumenter";
import {relativePathForCollectorMap} from "./function-instrumenter";

export class MethodInstrumenter {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  instrument(sourceFilePath: string, className: string, methodName: string) {
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

    this.instrumentBody(wrapFunction)

    // Instrument input parameters
    wrapFunction.addParameters([{name: 'this'}])
    this.setParametersCollectors(sourceMethod, wrapFunction)

    this.wrapInTryCatch(wrapFunction)

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

  private setParametersCollectors(sourceFunc: FunctionDeclaration | MethodDeclaration, wrapFunc: FunctionDeclaration) {
    const parameters: { name: string, type: string }[] = []

    sourceFunc.getParameters().forEach(param => {
      parameters.push({
        name: param.getName(),
        type: param.getType().getText()
      })
      wrapFunc.insertStatements(0,
        collectorCreator.addInfo(
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

  private wrapInTryCatch(wrapFunc: FunctionDeclaration) {
    wrapFunc.getBody()!.replaceWithText(writer =>
      writer
        .write('{').newLine()
        .write('try {').newLine()
        .write(wrapFunc.getBodyText()!)
        .write('} catch (error: any) {').newLine()
        .write(
          collectorCreator.addInfo(
            'error.message',
            'exception',
            wrapFunc.getName()!,
            wrapFunc.getSourceFile().getFilePath(),
            wrapFunc.getStartLineNumber())
        )
        .write('}}')
    )
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
