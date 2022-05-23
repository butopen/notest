import {InstrumentedEvent} from "@butopen/notest-model/dist";

export function mapToInstrumentedEvent(dbResult): InstrumentedEvent[] {
  return dbResult.map(elem => {
    return {
      script: elem['scripttype'],
      type: elem['nttype'],
      value: elem['value']['content'],
      line: elem['line'],
      function: elem['functionname'],
      file: elem['filepath'],
      timestamp: elem['fired'],
      other: elem['other']
    }
  })
}