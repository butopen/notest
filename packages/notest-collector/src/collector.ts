import {InstrumentedEvent} from "@butopen/notest-model"
import {RequestInfo, RequestInit} from 'node-fetch';
import {stringify} from 'flatted';

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));


class NoTestCollector {
  private static eventsToSend: InstrumentedEvent[];

  constructor() {
    setInterval(() => NoTestCollector.send(), 5000)
    NoTestCollector.eventsToSend = []
  }

  private static async send() {
    if (NoTestCollector.eventsToSend.length) {
      let data = NoTestCollector.eventsToSend.splice(0)
      try {
        console.log("sending events to db")
        const rawResponse = await fetch("http://localhost:3000/api/instrumented-event", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
        const response = await rawResponse.json();
        console.log(response)
        if (!rawResponse.ok) {
          data.forEach(event => NoTestCollector.eventsToSend.push(event))
        }
      } catch (e2) {
        data.forEach(event => NoTestCollector.eventsToSend.push(event))
        console.log("e : ", e2);
        throw new Error("Could not send events");
      }
    }
  }

  /**
   * .collect({type: "input"}, {...})
   * @param event
   */
  async collect(event: InstrumentedEvent) {
    if (this.toSend(event)) {
      NoTestCollector.eventsToSend.push(event)
      console.log("collecting: ", event)
    }
  }

  private toSend(event: InstrumentedEvent) {
    return typeof event.value['content'] !== 'object'
  }
}

export const collector = new NoTestCollector()
