import fs from 'fs'

function getMapRules(mapRulePath: string) {
  try {
    return fs.readFileSync(mapRulePath.toString())
  } catch (e: any) {
    fs.writeFileSync(mapRulePath, '{}')
    return fs.readFileSync(mapRulePath.toString())
  }
}

class InstrumentationRules {
  private mapRules: { [path: string]: { [file: string]: boolean } };
  private mapRulePath: string

  constructor() {
    this.mapRulePath = process.cwd() + '/map-rules.json'
    this.mapRules = JSON.parse(getMapRules(this.mapRulePath).toString())
  }

  check(pair: { path: string, name: string }): boolean {
    if (this.mapRules[pair.path]) {
      return this.mapRules[pair.path][pair.name]
    } else {
      console.log("(" + pair.path + "," + pair.name + ") rule of instrumentation not found")
      return false
    }
  }

  updateMapRules(pair: { path: string, name: string }) {
    if (this.mapRules[pair.path]) {
      this.mapRules[pair.path][pair.name] = true
    } else {
      this.mapRules[pair.path] = {[pair.name]: true}
    }
    fs.writeFileSync(this.mapRulePath, JSON.stringify(this.mapRules))
  }
}

export const instrumentationRules = new InstrumentationRules()
