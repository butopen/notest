import {InstrumentedFunctionEvent} from "@butopen/notest-model"

class NoTestCollector {
  private static eventsToSend: InstrumentedFunctionEvent[];

  constructor() {
    setInterval(() => NoTestCollector.send(NoTestCollector.eventsToSend), 5000)
  }

  private static async send(events: InstrumentedFunctionEvent[]) {
    if (events) {
      let options1 = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(events),
      };

      let response = await fetch(
        "http://localhost:3000/api/instrumented-function-event",
        options1
      );
      if (response.ok) {
        NoTestCollector.eventsToSend.splice(0)
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
  }
}

export const collector = new NoTestCollector()
