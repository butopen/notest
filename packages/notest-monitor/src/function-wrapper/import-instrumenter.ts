import {FunctionDeclaration, SourceFile, SyntaxKind} from "ts-morph";

export class ImportInstrumenter {

  destinationImportsChanger(sourceFunction: FunctionDeclaration, wrapFunction: FunctionDeclaration) {
    const sourceFunctionName = sourceFunction.getName()
    const sourceFileName = sourceFunction.getSourceFile().getBaseNameWithoutExtension()
    let imports = sourceFunction.findReferencesAsNodes()
      .map(value => value.getFirstAncestor(node => node.getKind() == SyntaxKind.ImportDeclaration))
      .filter(value => value)
      .filter(value =>
        value!.getSourceFile().getFilePath() != sourceFunction.getSourceFile().getFilePath()
        && value!.getSourceFile().getFilePath() != wrapFunction.getSourceFile().getFilePath())
      .map(value => value!.asKindOrThrow(SyntaxKind.ImportDeclaration)) //restituisce sempre un unico import per file?

    imports.forEach(imp => {
      imp.getImportClause()!.getNamedImports().forEach(
        name => {
          if (name.getName() != sourceFunctionName) {
            //rewrite imports of other functions imported from same file
            imp.getSourceFile().insertStatements(0, `import { ${name.getText()} } from '${imp.getModuleSpecifierValue()}'`)
          } else {
            //replace import of function with instrumented one
            let arrayElementPath = imp.getModuleSpecifier()!.getText().replace(/\\/g, '/')
              .split('/').slice(0, -1)
            arrayElementPath.push(`instrumentation/${sourceFileName}`)
            let newPath = arrayElementPath.join('/')
            imp.getSourceFile().insertStatements(0, `import { ${sourceFunctionName}Instrumented as ${sourceFunctionName} } from '${newPath.slice(1)}'`)
          }
        })
      imp.remove()
    })
  }

  addImports(sourceFile: SourceFile, wrapFile: SourceFile, sourceFunction: FunctionDeclaration) {
    sourceFile.getImportDeclarations().forEach(imp => {
      wrapFile.insertStatements(0, imp.getFullText())
    })
    wrapFile.insertStatements(0, writer =>
      writer
        .write(`import {InstrumentedFunctionEvent} from '@butopen/notest-model'`).newLine()
        .write(`import {collector, instrumentationRules} from '@butopen/notest-collector'`).newLine()
        .writeLine(`import {${sourceFunction.getName()} as ${sourceFunction.getName()}Real} from '../${sourceFile.getBaseNameWithoutExtension()}'`))
  }
}