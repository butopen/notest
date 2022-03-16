export class InfoAdderForCollector {

  static addInfo(variableToCollect: string, type: string, line: number) {
    return `collector.collect({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line}
    })`
  }
}