import {InstrumentedEvent} from "@butopen/notest-model";
import fetch from "node-fetch";

test("send an event to the backend", async () => {
  let events: InstrumentedEvent[] = [];
  events.push({
    script: "function",
    type: "input",
    value: {some_input: "some"},
    line: 1,
    function: "functionTest",
    file: "fileTest",
    timestamp: 11
  })

  try {
    const rawResponse = await fetch("http://localhost:3000/api/instrumented-function-event", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(events)
    });
    console.log(JSON.stringify(rawResponse))

  } catch (e2) {
    console.log("e : ", e2);
  }

})
