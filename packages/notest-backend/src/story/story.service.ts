import { Injectable } from '@nestjs/common';
import { NTInstrumentedEvent } from '@notest/common';
import { InstrumentedEventService } from '../instrumented-event/instrumented-event.service';

@Injectable()
export class StoryService {
  constructor(private instrumentedEventService: InstrumentedEventService) {}

  async getFullTextOfRoutine(request: {
    projectName: string;
    path: string;
    name: string;
    created: string;
  }) {
    const result = await this.instrumentedEventService.getFullTextFromDb(
      request,
    );
    result[0].event_value = Buffer.from(
      result[0].event_value,
      'base64',
    ).toString('binary');
    return result[0];
  }

  async getRoutine(request: {
    projectName: string;
    path: string;
    name: string;
    created: string;
  }) {
    const result = await this.instrumentedEventService.getRoutine(request);

    let routine: {
      inputs: NTInstrumentedEvent[];
      statements: NTInstrumentedEvent[];
      output: NTInstrumentedEvent;
    } = { inputs: [], statements: [], output: undefined };

    result.forEach((event: NTInstrumentedEvent) => {
      switch (event.event_type) {
        case 'input': {
          routine.inputs.push(event);
          break;
        }
        case 'variable': {
          routine.statements.push(event);
          break;
        }
        case 'expression': {
          routine.statements.push(event);
          break;
        }
        case 'output': {
          routine.output = event;
          break;
        }
      }
    });
    return routine;
  }
}
