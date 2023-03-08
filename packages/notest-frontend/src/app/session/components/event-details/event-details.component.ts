import { Component, Input, OnInit } from '@angular/core';
import { BLSessionEvent } from '@notest/common';
import { UrlParamsService } from '../../../shared/services/url-params.service';

@Component({
  selector: 'nt-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  @Input() event!: BLSessionEvent;
  reference!: string;

  constructor(private urlParamsService: UrlParamsService) {}

  ngOnInit() {
    this.reference = this.urlParamsService.get('reference')!;
  }
}
