import {Body, Controller, Post} from '@nestjs/common';
import {InstrumentedService} from './instrumented.service';
import {InstrumentedEvent} from "@butopen/notest-model";

@Controller('api')
export class InstrumentedEventController {
  constructor(private readonly senderService: InstrumentedService) {
  }

  @Post('instrumented-event')
  async instrumentedEvent(@Body() events: InstrumentedEvent[]) {
    console.log('received packet:' + events.length)
    events.forEach(event => console.log(event))
    await this.senderService.bulkSave(events)
    return {ok: true};
  }
}

