import {Body, Controller, Post} from '@nestjs/common';
import {StoryApiService} from "./story-api.service";

@Controller('story-api')
export class StoryApiController {
  constructor(private readonly storyApiService: StoryApiService) {
  }

  @Post('full-text')
  async getText(@Body() request: { path: string, name: string, created: string }) {
    await this.storyApiService.getFullTextOfRoutine(request).then((result) => console.log(JSON.stringify(result)))
  }

  @Post('routine')
  async getRoutine(@Body() request: { path: string, name: string, created: string }) {
    await this.storyApiService.getRoutine(request).then((result) => console.log(JSON.stringify(result)))
  }
}
