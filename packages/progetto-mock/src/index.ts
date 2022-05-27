import {Calculator} from "./calculator";
import {Adder} from "./adder";
import {Operation} from "./operation.interface";
import "./instrumentLogic"

const operation: Operation = new Adder()
const calculator = new Calculator(operation)

for (let i = 0; i < 1; i++) {
  console.log(calculator.execute(Math.random(), Math.random()))
}