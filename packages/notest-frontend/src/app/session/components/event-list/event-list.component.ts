import { Component, Input } from '@angular/core';
import { BLSessionEvent, NTEventLabelsMap } from '@notest/common';

@Component({
  selector: 'nt-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent {
  @Input() session: BLSessionEvent[] = [];
  selected?: number;

  eventLabelsMap = NTEventLabelsMap;
  ngOnInit() {}
}
