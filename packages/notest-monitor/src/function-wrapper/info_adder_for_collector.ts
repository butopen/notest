export class InfoAdderForCollector {

  static addInfo(variableToCollect: string, type: string, functionName: string, fileName: string, line: number) {
    return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      file: '${fileName}',
      timestamp: Date.now()
    })`
  }
}