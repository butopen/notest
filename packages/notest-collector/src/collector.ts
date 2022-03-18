import {CollectEvent} from "./collector.model";


class NoTestCollector {

  /**
   * .collect({type: "input"}, {...})
   * @param events
   */
  async collect(...events: CollectEvent[]) {
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
  }
}

export const collector = new NoTestCollector()
