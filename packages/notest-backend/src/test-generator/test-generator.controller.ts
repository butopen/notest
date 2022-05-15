import {Body, Controller, Post} from '@nestjs/common';
import {TestGeneratorService} from "./test-generator.service";
import {InstrumentedEvent} from "@butopen/notest-model";
import {Project} from "ts-morph";

@Controller('test-generator')
export class TestGeneratorController {
  private readonly project

  constructor(private readonly testGeneratorService: TestGeneratorService) {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  @Post('generate-test')
  async testGenerator(@Body() scriptInfo) { //TODO define TestInstruction Model

    let generationInstructions: { scriptType, scriptData: { routine: InstrumentedEvent[] }[] }
      = await this.testGeneratorService.getInfoFromDb(scriptInfo)

    for (let routine of generationInstructions.scriptData) {
      if (generationInstructions.scriptType == "method") {
        await this.testGeneratorService.generateMethodTest(routine.routine, this.project)
      } else {
        await this.testGeneratorService.generateFunctionTest(routine.routine, this.project)
      }
    }
    return {ok: true};
  }
}
