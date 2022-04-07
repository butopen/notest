import path from "path";
import {relativePathForCollectorMap} from "@butopen/notest-collector";

test("test empty relative path", async () => {
  const p = relativePathForCollectorMap("")
  expect(p).toBe("")
})

test("test relative path", async () => {
  const p = relativePathForCollectorMap("x")
  expect(p).toBe("x")
})

test("test absolute to relative path", async () => {
  const workingDir = path.resolve(".")
  console.log("workingDir: ", workingDir)
  const p = relativePathForCollectorMap(workingDir + "/x")
  expect(p).toBe("x")
})
