import {instrument_getVariableAtIndex,useInstrumented_getVariableAtIndex} from './instrumentation/calculator'
import {Operation} from "./operation.interface";

export class Calculator {
  private operation: Operation
  private variables: { value: number }[]

  constructor(operation: Operation) {
    this.operation = operation
    this.variables = []
  }

  execute(op1: number, op2: number) {
    this.operation.addVariable1(op1)
    this.operation.addVariable2(op2)
    this.variables = [{value: op1}, {value: op2}]
    return this.operation.doCalc(this.variables)
  }

  getInfoOnVariable(idx: number) {
    return getVariableAtIndex(idx, this.variables)
  }
}

function getVariableAtIndex(idx: number, variables: { value: number }[]) {
  const result = variables[idx].value
  return result
}
/* decorated by notest... just ignore -> */if(useInstrumented_getVariableAtIndex()){(getVariableAtIndex as any) =  instrument_getVariableAtIndex()}

