import {Body, Controller, Post} from '@nestjs/common';
import {InstrumentedFunctionService} from './instrumented-function.service';
import {InstrumentedFunctionEvent} from "@butopen/notest-model";

@Controller()
export class InstrumentedEventController {
  constructor(private readonly senderService: InstrumentedFunctionService) {
  }

  @Post('instrumented-function-event')
  async instrumentedFunctionEvent(@Body() events: InstrumentedFunctionEvent[]) {
    await this.senderService.bulkSave(events)
    return {ok: true};
  }
}

