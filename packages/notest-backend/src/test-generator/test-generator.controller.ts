import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TestGeneratorService } from './test-generator.service';
import { BLSessionEvent, NTInstrumentedEvent } from '@notest/common';
import { Project } from 'ts-morph';
import { SessionService } from '@notest/backend-shared';

@Controller('generator')
export class TestGeneratorController {
  private readonly project;

  constructor(
    private readonly testGeneratorService: TestGeneratorService,
    private sessionService: SessionService
  ) {
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json'
    });
  }

  @Post('generate-unit-test')
  async testGenerator(@Body() scriptInfo) {
    scriptInfo = JSON.parse(scriptInfo);
    console.log('instructions arrived: ' + JSON.stringify(scriptInfo));
    const generationInstructions: {
      scriptType;
      scriptData: { routine: NTInstrumentedEvent[] }[];
    } = await this.testGeneratorService.getRoutines(scriptInfo);
    if (generationInstructions.scriptType == '') {
      return { ok: false, error: 'no such function/method on db' };
    }
    for (const routine of generationInstructions.scriptData) {
      if (generationInstructions.scriptType == 'method') {
        await this.testGeneratorService.generateMethodTest(routine.routine, this.project);
      } else {
        await this.testGeneratorService.generateFunctionTest(routine.routine, this.project);
      }
    }
    return { ok: true };
  }

  @Get('generate-session-test')
  async generateSessionTest(@Query('reference') reference: string) {
    const session: BLSessionEvent[] = await this.sessionService.read(reference);
    const script = await this.testGeneratorService.generateSessionTest(session);
    return { ok: true, script };
  }
}
