import {SourceFile} from "ts-morph";
import path from "path";

export class ImportInstrumenter {

  addImportsWrapFile(sourceFile: SourceFile, wrapFile: SourceFile) {
    sourceFile.getImportDeclarations().forEach(imp => {
      const importClause = imp.getImportClause() ?? imp.getDefaultImport()
      let importModule: string
      if (imp.getModuleSpecifier().getText().search(/[\\\/]/g) != -1
        && !imp.getModuleSpecifier().getText().includes('@')) {
        importModule = '../' + imp.getModuleSpecifier().getText().slice(1, -1)
      } else {
        importModule = imp.getModuleSpecifier().getText().slice(1, -1)
      }
      const newImport = `import ${importClause!.getText()} from '${importModule}'`
      wrapFile.insertStatements(0, newImport)
    })
    wrapFile.insertStatements(0, writer =>
      writer
        .write(`import {collector} from '@butopen/notest-collector'`).newLine()
        .write(`import {instrumentationRules} from '@butopen/notest-collector'`).newLine())
  }

  addInstrumentationImportsFunction(file: SourceFile, nameWrapFunction, nameSourceFunction) {

    file.insertStatements(0, writer => {
      writer.write(`import {${nameWrapFunction},useInstrumented_${nameSourceFunction}} from './instrumentation/${file.getBaseNameWithoutExtension()}'`).newLine()
    })
  }

  addInstrumentationImportsMethod(sourceFile: SourceFile, file: SourceFile, wrapFile: SourceFile, nameWrapFunction, nameSourceFunction, className: string) {
    const pathLogicFile = path.relative('./src', wrapFile.getFilePath()).replace(/\\/g, '/').slice(0, -3)
    file.insertStatements(0, writer => {
      writer.write(`import {${nameWrapFunction},useInstrumented_${nameSourceFunction}} from './${pathLogicFile}'`).newLine()
    })

    const pathSourceFile = path.relative('./src', sourceFile.getFilePath()).replace(/\\/g, '/').slice(0, -3)
    file.insertStatements(0, writer => {
      writer.write(`import {${className}} from './${pathSourceFile}'`).newLine()
    })
  }
}