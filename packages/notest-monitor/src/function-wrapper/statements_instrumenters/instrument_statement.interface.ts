import {FunctionDeclaration, Node} from "ts-morph";

export interface InstrumentStatementInterface {
  addCollector(statement: Node, wrapFunction: FunctionDeclaration): void
}