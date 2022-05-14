import {InstrumentedEvent} from "@butopen/notest-model";
import objectHash from "object-hash";

export function makeTitle(inputs: InstrumentedEvent[]) {
  return inputs.map(elem => {
    if (typeof elem.value == "object") {
      return objectHash(elem.value)
    } else {
      return elem.value
    }
  }).join('-');
}

export function giveParamsAndExpected(inputs: InstrumentedEvent[], output: InstrumentedEvent) {

  let params = "";
  inputs.forEach(input => {
    switch (typeof input.value) {
      case "string": {
        params += `,"${input.value}"`
        break;
      }
      case "object": {
        params += `,${JSON.stringify(input.value)}`
        break;
      }
      default: {
        params += `,${input.value}`
      }
    }
  })
  params = params.substring(1)

  let returnValue;
  if (typeof output.value == "string") {
    returnValue = '"' + output.value + '"';
  } else {
    returnValue = output.value;
  }

  return {params, returnValue}
}