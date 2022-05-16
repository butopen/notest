import {relativePathForCollectorMap} from "./shared/relative-path.util";

class CollectorCreator {

  addInfo(script: string, variableToCollect: string, type: string, functionName: string, filePath: string, line: number, other?: any) {
    if (script == 'method') {
      return `collector.collect({
      script: '${script}',
      type: '${type}',
      value: {content: ${variableToCollect}},
      line: ${line},
      function: "'" + this.constructor.name + "." + ${functionName} + "'",
      file: '${relativePathForCollectorMap(filePath)}',
      timestamp: Date.now(),
      other: ${other}
    })`
    }
    return `collector.collect({
      script: '${script}',
      type: '${type}',
      value: {content: ${variableToCollect}},
      line: ${line},
      function: '${functionName}',
      file: '${relativePathForCollectorMap(filePath)}',
      timestamp: Date.now(),
      other: ${other}
    })`
  }


}

export const collectorCreator = new CollectorCreator()
