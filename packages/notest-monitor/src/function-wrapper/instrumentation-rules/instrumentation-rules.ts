import {mapRules} from "./map-rules";

class InstrumentationRules {
  private mapRules: {};

  constructor() {
    this.mapRules = mapRules
  }

  check(pair: { path: string, name: string }): boolean {
    return mapRules[pair.path][pair.name]
  }
}

export const instrumentationRules = new InstrumentationRules()