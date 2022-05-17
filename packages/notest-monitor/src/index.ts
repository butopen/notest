import {EventsListener} from "./monitor/events-listener";
import * as fs from "fs";

//const __dirname = dirname(fileURLToPath(import.meta.url));


let jsonConfigPath = "notest.json";
let rawdata = fs.readFileSync(jsonConfigPath).toString();
let config = JSON.parse(rawdata);

const eventListener = new EventsListener(config.path)

eventListener.listen().then(path => console.log(`listening on path '${path}'`))