import {SourceFile} from "ts-morph";

export class ImportInstrumenter {

  addImportsWrapFile(sourceFile: SourceFile, wrapFile: SourceFile) {
    sourceFile.getImportDeclarations().forEach(imp => {
      wrapFile.insertStatements(0, imp.getFullText())
    })
    wrapFile.insertStatements(0, writer =>
      writer
        .write(`import {collector} from '@butopen/notest-collector'`).newLine())
  }

  addImportsSourceFile(sourceFile: SourceFile, nameFunction) {

    sourceFile.insertStatements(0, writer => {
      writer.write(`import {${nameFunction}} from './instrumentation/${sourceFile.getBaseNameWithoutExtension()}'`).newLine()
      writer.write(`import {instrumentationRules} from '@butopen/notest-collector'`).newLine()
    })
  }
}