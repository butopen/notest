export class InfoAdderForCollector {

  static addInfo(variableToCollect: string, type: string, functionName: string, line: number) {
    return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line},
      function: '${functionName}',
      timestamp: Date.now()
    })`
  }
}