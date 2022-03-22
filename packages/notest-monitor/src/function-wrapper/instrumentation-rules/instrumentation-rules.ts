import {mapRules} from "./map-rules";

class InstrumentationRules {
  private mapRules: {[path:string]: {[functionName:string]: boolean | ((path:string, functionName:string)=>boolean)}};

  constructor() {
    this.mapRules = mapRules
  }

  check(pair: { path: string, name: string }): boolean {
    const rule =  mapRules[pair.path][pair.name]
    if(isFunction(rule))
      return rule(pair.path, pair.name)
    else 
      return rule
  }
}

export const instrumentationRules = new InstrumentationRules()

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
