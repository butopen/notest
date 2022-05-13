import {Body, Controller, Post} from '@nestjs/common';
import {TestGeneratorService} from "./test-generator.service";
import {InstrumentedEvent} from "@butopen/notest-model";

@Controller('test-generator')
export class TestGeneratorController {
  constructor(private readonly testGeneratorService: TestGeneratorService) {
  }

  @Post('generate-test')
  async testGenerator(@Body() scriptInfo) { //TODO define TestInstruction Model

    let generationInstructions: { scriptType, scriptData: { routine: InstrumentedEvent[] }[] }
      = await this.testGeneratorService.getInfoFromDb(scriptInfo)

    for (let routine of generationInstructions.scriptData) {
      if (generationInstructions.scriptType == "method") {
        await this.testGeneratorService.generateMethodTest(routine.routine)
      } else {
        await this.testGeneratorService.generateFunctionTest(routine.routine)
      }
    }
    return {ok: true};
  }
}
