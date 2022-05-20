import {getIdxsFromString} from "../../src/monitor/git-events-handler";

test("git handler", async () => {
  const changes = "@@ -1,2 +3,4 @@ .. @@ -1,2 +3,4 @@..@@ -1,2 +3,4 @@..@@ -1,2 +3,4 @@..@@ -1,2 +3,4 @@"
  expect(getIdxsFromString(changes)).toEqual(
    [
      {start: 3, end: 7},
      {start: 3, end: 7},
      {start: 3, end: 7},
      {start: 3, end: 7},
      {start: 3, end: 7}
    ])
})