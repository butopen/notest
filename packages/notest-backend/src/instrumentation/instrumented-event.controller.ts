import {Body, Controller, Post} from '@nestjs/common';
import {InstrumentedFunctionService} from './instrumented-function.service';
import {InstrumentedFunctionEvent} from "@butopen/notest-model";

@Controller('api')
export class InstrumentedEventController {
  constructor(private readonly senderService: InstrumentedFunctionService) {
  }

  @Post('instrumented-function-event')
  async instrumentedFunctionEvent(@Body() events: InstrumentedFunctionEvent[]) {
    console.log('received packet:' + events.length)
    await this.senderService.bulkSave(events)
    return {ok: true};
  }
}

