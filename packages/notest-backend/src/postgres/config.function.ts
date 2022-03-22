import {readFileSync} from "fs";
import {join} from "path";

export function loadConfig() {
  const json = readFileSync(join(__dirname, "config.json"), 'utf8')
  return JSON.parse(json)
}