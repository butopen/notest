export class InfoAdderForCollector {

  static addInfo(variableToCollect: string, type: string, line: number) {
    return `eventsToCollect.push({
      type: '${type}',
      value: ${variableToCollect},
      line: ${line}
    })`
  }
}