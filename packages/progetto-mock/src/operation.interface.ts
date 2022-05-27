export interface Operation {
  op1: {value: number}
  op2: {value: number}

  doCalc(variables): number

  addVariable1(number: number): void;

  addVariable2(number: number): void;
}