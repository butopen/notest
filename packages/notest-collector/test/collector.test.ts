import {instrumentationRules} from "../src";
import fs from "fs";

test("test create rules and update", () => {
  let obj = {'path1': {'fileA': true}}
  fs.writeFileSync('map-rules.json', JSON.stringify(obj))
  instrumentationRules.updateMapRules({path: 'path1', name: 'fileA'}, false)

  instrumentationRules.updateMapRules({path: 'path2', name: 'fileB'}, true)

  const objRes = JSON.parse(fs.readFileSync('map-rules.json').toString())

  expect(objRes['path1']['fileA']).toBe(false)
  expect(objRes['path2']['fileB']).toBe(true)
  fs.rmSync('map-rules.json')
})