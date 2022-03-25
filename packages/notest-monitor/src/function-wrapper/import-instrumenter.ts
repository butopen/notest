import {FunctionDeclaration, SourceFile} from "ts-morph";
import * as path from "path";

export class ImportInstrumenter {

  destinationImportsChanger(sourceFunction: FunctionDeclaration, wrapFunction: FunctionDeclaration) {
    const sourceFunctionName = sourceFunction.getName()
    const sourceFileName = sourceFunction.getSourceFile().getBaseNameWithoutExtension()
    //filter original file and wrapped file from references
    const externalReferences = sourceFunction.findReferences()
      .filter(ref =>
        !(ref.getReferences()[0].getSourceFile().getFilePath() == sourceFunction.getSourceFile().getFilePath()
          || ref.getReferences()[0].getSourceFile().getFilePath() == wrapFunction.getSourceFile().getFilePath()))

    //get sourceFiles
    const externalReferencesSourceFile = externalReferences.map(ref => ref.getReferences()[0].getSourceFile())

    externalReferencesSourceFile.forEach(file => {
      let arrayImportRef = file.getImportDeclarations()
        .filter(imp =>
          path.resolve(imp.getModuleSpecifierValue())
            .replace(/\\/g, '/') == sourceFunction.getSourceFile().getFilePath().replace(/\\/g, '/'))[0]
      if (arrayImportRef) {
        arrayImportRef.getImportClause()!.getNamedImports().forEach(
          name => {
            if (name.getName() != sourceFunctionName) {
              //rewrite imports of other functions imported from same file
              file.insertStatements(0, `import { ${name.getText()} } from '${arrayImportRef.getModuleSpecifierValue()}'`)
            } else {
              //replace import of function with instrumented one
              let arrayElementPath = arrayImportRef.getModuleSpecifier()!
                .getText()
                .replace(/\\/g, '/')
                .split('/')
                .slice(0, -1)
              arrayElementPath.push(`instrumentation/${sourceFileName}`)
              let newPath = arrayElementPath.join('/')
              file.insertStatements(0, `import { ${sourceFunctionName}Instrumented as ${sourceFunctionName} } from '${newPath.slice(1)}'`)
            }
          }
        )
        arrayImportRef.remove()
      } else {
        file.insertStatements(0, `import { ${sourceFunctionName}Instrumented as ${sourceFunctionName} } from './instrumentation/${sourceFunctionName}'`)
      }
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