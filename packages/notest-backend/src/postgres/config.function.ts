import {readFileSync} from "fs";

export function loadConfig() {
  const json = readFileSync("config.json", 'utf8')
  return JSON.parse(json)
}