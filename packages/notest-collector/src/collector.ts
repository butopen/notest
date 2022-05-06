import {InstrumentedFunctionEvent} from "@butopen/notest-model"
import {RequestInfo, RequestInit} from 'node-fetch';
import {stringify} from 'flatted';

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));


class NoTestCollector {
  private static eventsToSend: InstrumentedFunctionEvent[];

  constructor() {
    setInterval(() => NoTestCollector.send(NoTestCollector.eventsToSend), 5000)
  }

  private static async send(events: InstrumentedFunctionEvent[]) {
    if (events) {
      try {
        console.log("sending events to db")
        const rawResponse = await fetch("http://localhost:3000/api/instrumented-function-event", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: stringify(events)
        });
        const content = await rawResponse.json();
        console.log(content)
      } catch (e2) {
        console.log("e : ", e2);
        throw new Error("Could not send events");
      }
    }
  }

  /**
   * .collect({type: "input"}, {...})
   * @param event
   */
  async collect(event: InstrumentedFunctionEvent) {
    if (!NoTestCollector.eventsToSend) {
      NoTestCollector.eventsToSend = []
    }
    NoTestCollector.eventsToSend.push(event)
    console.log("collecting: ", event)
  }
}

export const collector = new NoTestCollector()
