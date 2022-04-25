import {EventsListener} from "../src/monitor/events-listener";

describe(`Testing Event Listener`, () => {

  test("test event listener simple", async () => {
    const eventListener = new EventsListener(__dirname)

    await eventListener.listen().then(re => console.log(re))
  })
})