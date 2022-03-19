import {CollectEvent} from "./collector.model";


class NoTestCollector {
  private static eventsToSend: CollectEvent[];

  constructor() {
    setInterval(() => NoTestCollector.send(NoTestCollector.eventsToSend), 5000)
  }

  private static async send(events: CollectEvent[]) {
    let options1 = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    };

    let response = await fetch(
      "http://localhost:3000/api/addFunctionInfo",
      options1
    );
    if (response.ok)
      NoTestCollector.eventsToSend.splice(0)
  }

  /**
   * .collect({type: "input"}, {...})
   * @param event
   */
  async collect(event: CollectEvent) {
    if (!NoTestCollector.eventsToSend)
      NoTestCollector.eventsToSend = []
    NoTestCollector.eventsToSend.push(event)
  }
}

export const collector = new NoTestCollector()
