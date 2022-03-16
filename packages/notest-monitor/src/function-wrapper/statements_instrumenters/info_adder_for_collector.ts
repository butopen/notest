export class InfoAdderForCollector {

  static addInfo(variableToCollect: string, type: string) {
    return `{
      type: '${type}',
      value: ${variableToCollect}
    }`
  }
}