import {EventsListener} from "./monitor/events-listener";
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const eventListener = new EventsListener(__dirname + "/../src")

eventListener.listen().then(path => console.log(`listening on path '${path}'`))