import {CollectEvent} from "./collector.model";


class NoTestCollector {

    /**
     * .collect({type: "input"}, {...})
     * @param events
     */
    collect(...events:CollectEvent[]){
        // collect
    }
    
}

export const collector = new NoTestCollector()
