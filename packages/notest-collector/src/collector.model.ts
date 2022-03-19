export interface CollectEvent {
  type: "input" | "output" | "variable" | "expression",
  value: any,
  line: number,
  function: string,
  file: string,
  timestamp: number
}
