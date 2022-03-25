import {relativePathForCollectorMap} from "./wrapper";

class CollectorCreator {

  addInfo(variableToCollect: string, type: string, functionName: string, filePath: string, line: number, other?: any) {
    if (other) {
      return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${relativePathForCollectorMap(filePath)}',
      timestamp: Date.now(),
      other: ${other}
    })`
    }
    return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${relativePathForCollectorMap(filePath)}',
      timestamp: Date.now()
    })`
  }
}

export const collectorCreator = new CollectorCreator()