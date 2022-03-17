import {CollectEvent} from "./collector.model";


class NoTestCollector {

  /**
   * .collect({type: "input"}, {...})
   * @param events
   */
  collect(...events: CollectEvent[]) {
    // TODO: backend sender and add informations
  }
}

export const collector = new NoTestCollector()
