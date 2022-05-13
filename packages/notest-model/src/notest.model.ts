export interface InstrumentedEvent {
  script: "method" | "function",
  type: "input" | "output" | "variable" | "expression" | "exception",
  value: any,
  line: number,
  function: string,
  file: string,
  timestamp: number,
  other?: any
}
