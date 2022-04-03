import path from "path";

class CollectorCreator {

  addInfo(variableToCollect: string, type: string, functionName: string, filePath: string, line: number, other?: any) {
    if (other) {
      return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${this.relativePathForCollectorMap(filePath)}',
      timestamp: Date.now(),
      other: ${other}
    })`
    }
    return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${this.relativePathForCollectorMap(filePath)}',
      timestamp: Date.now()
    })`
  }

  relativePathForCollectorMap(pathAbs: string) {
    let relPath = path.relative(path.resolve("."), pathAbs).toString()
    return relPath.replace(/\\/g, '/')
  }
}

export const collectorCreator = new CollectorCreator()