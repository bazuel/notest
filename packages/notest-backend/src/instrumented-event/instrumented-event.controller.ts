import { Body, Controller, Post } from '@nestjs/common';
import { InstrumentedEventService } from './instrumented-event.service';
import { NTInstrumentedEvent } from '@notest/common';

@Controller('instrumented-event')
export class InstrumentedEventController {
  constructor(
    private readonly instrumentedEventService: InstrumentedEventService,
  ) {}

  @Post('save')
  async instrumentedEvent(@Body() events: NTInstrumentedEvent[]) {
    console.log('received packet:' + events.length);
    events.forEach((event) => console.log(event));
    await this.instrumentedEventService.bulkSave(events);
    return { ok: true };
  }
}
