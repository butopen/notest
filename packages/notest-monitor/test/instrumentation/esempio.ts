/*import {test as t} from "./"
import {collector} from "@butopen/notest-collector/dist";
import {instrumentationRules} from "../../src/function-wrapper/instrumentation-rules/instrumentation-rules";

export function testInstrumented() {
  const var1 = 1
  while (var1 == 1) {

    const var2 = var1

    collector.collect({
      type: 'variable',
      value: var2,
      line: 5,
      function: 'testInstrumented',
      timestamp: Date.now()
    })
    while (var1 == 1) {

      const var3 = 1

      collector.collect({
        type: 'variable',
        value: var3,
        line: 16,
        function: 'testInstrumented',
        timestamp: Date.now()
      })
    }
  }
}

function whatToReturn() {

  if (instrumentationRules.check({path: "pathFunction", name: "functioName"}))
    return testReal
  else
    return testInstrumented
}


export const test = whatToReturn()

// TODO: creare backend
// Todo: lavorare su frontend
*/