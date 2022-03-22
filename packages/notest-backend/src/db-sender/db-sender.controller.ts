import {Body, Controller, Post} from '@nestjs/common';
import {DbSenderService} from './db-sender.service';
import {CollectEvent} from "@butopen/notest-collector/dist";

@Controller()
export class DbSenderController {
  constructor(private readonly senderService: DbSenderService) {
  }

  @Post('addFunctionInfo')
  async addFunctionInfo(@Body() events: CollectEvent[]) {
    for (const event in events) {
      this.senderService.sendToDb(event)
    }
    return {ok: true};
  }
}
