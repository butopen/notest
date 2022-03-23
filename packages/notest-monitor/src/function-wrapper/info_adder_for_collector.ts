import * as path from "path";

export class InfoAdderForCollector {

  static addInfo(variableToCollect: string, type: string, functionName: string, filePath: string, line: number, other?: any) {
    if (other) {
      return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${relativePath(filePath)}',
      timestamp: Date.now(),
      other: ${other}
    })`
    }
    return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${relativePath(filePath)}',
      timestamp: Date.now()
    })`
  }
}

function relativePath(pathAbs: string) {
  let relPath = path.relative('notest-monitor', pathAbs).toString()
  return relPath.replace(/\\/g, '/')
}