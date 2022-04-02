import {SourceFile} from "ts-morph";

export class ImportInstrumenter {

  addImportsWrapFile(sourceFile: SourceFile, wrapFile: SourceFile) {
    sourceFile.getImportDeclarations().forEach(imp => {
      const importClause = imp.getImportClause() ?? imp.getDefaultImport()
      let importModule: string
      if (imp.getModuleSpecifier().getText().search(/[\\@\/]/g) != -1) {
        importModule = '../' + imp.getModuleSpecifier().getText().slice(1, -1)
      } else {
        importModule = imp.getModuleSpecifier().getText().slice(1, -1)
      }
      const newImport = `import ${importClause!.getText()} from '${importModule}'`
      wrapFile.insertStatements(0, newImport)
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