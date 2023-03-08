import { Body, Controller, Post } from '@nestjs/common';
import { StoryService } from './story.service';

@Controller('story')
export class StoryController {
  constructor(private readonly storyApiService: StoryService) {}

  @Post('full-text')
  async getText(
    @Body()
    request: {
      projectName: string;
      path: string;
      name: string;
      created: string;
    },
  ) {
    await this.storyApiService
      .getFullTextOfRoutine(request)
      .then((result) => console.log(JSON.stringify(result)));
  }

  @Post('routine')
  async getRoutine(
    @Body()
    request: {
      projectName: string;
      path: string;
      name: string;
      created: string;
    },
  ) {
    await this.storyApiService
      .getRoutine(request)
      .then((result) => console.log(JSON.stringify(result)));
  }
}
