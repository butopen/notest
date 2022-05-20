export interface InstrumentedEvent {
  script: "method" | "function",
  type: "input" | "output" | "variable" | "expression" | "exception" | "text",
  value: any,
  line: number,
  function: string,
  file: string,
  timestamp: number,
  other?: any
}
