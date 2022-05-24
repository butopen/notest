import path from "path";
import {relativePathFromSource} from "@butopen/notest-collector";

test("test empty relative path", async () => {
  const p = relativePathFromSource("")
  expect(p).toBe("")
})

test("test relative path", async () => {
  const p = relativePathFromSource("x")
  expect(p).toBe("x")
})

test("test absolute to relative path", async () => {
  const workingDir = path.resolve(".")
  console.log("workingDir: ", workingDir)
  const p = relativePathFromSource(workingDir + "/x")
  expect(p).toBe("x")
})
