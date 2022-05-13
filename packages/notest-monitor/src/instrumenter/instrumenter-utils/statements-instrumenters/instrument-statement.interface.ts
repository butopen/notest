import {Node} from "ts-morph";

export interface InstrumentStatementInterface {
  addCollector(script: string, statement: Node, filepath: string, functionName: string): void
}