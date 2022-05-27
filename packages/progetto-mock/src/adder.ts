import {instrument_executeCalc,useInstrumented_executeCalc} from './instrumentation/adder'
import {Operation} from "./operation.interface";

export class Adder implements Operation {
  op1: { value: number };
  op2: { value: number };

  constructor() {
    this.op1 = {value: 0}
    this.op2 = {value: 0}
  }

  doCalc(variables): number {
    return executeCalc(variables[0].value, variables[1].value)
  }

  addVariable1(number: number): string {
    this.op1 = {value: number}
    return "added value: " + number
  }

  addVariable2(number: number): string {
    this.op2 = {value: number}
    return "added value: " + number
  }
}

function executeCalc(val1: number, val2: number) {
  return val1 + val2
}
/* decorated by notest... just ignore -> */if(useInstrumented_executeCalc()){(executeCalc as any) =  instrument_executeCalc()}

