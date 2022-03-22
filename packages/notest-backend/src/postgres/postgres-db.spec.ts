import {readFileSync} from "fs";
import {join} from "path";

test("prova", () => {
  const json = readFileSync(join(__dirname, "config.json"), 'utf8')
  console.log(JSON.parse(json))
})