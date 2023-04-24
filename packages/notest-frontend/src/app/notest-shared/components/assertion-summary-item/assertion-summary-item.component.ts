import { Component, Input, OnInit } from '@angular/core';
import {
  isHttpBodyRequestType,
  isHttpContentType,
  isHttpStatusType,
  isMissedEventsType,
  isRunSuccessfullyFinishedType,
  isVisualType,
  NTAssertion,
  NTAssertionName,
  NTAssertionType
} from '@notest/common';
@Component({
  selector: 'nt-assertion-summary-item',
  templateUrl: './assertion-summary-item.component.html',
  styleUrls: ['./assertion-summary-item.component.scss']
})
export class AssertionSummaryItemComponent implements OnInit {
  @Input()
  title!: string;

  @Input()
  type!: NTAssertionType | 'all';

  @Input()
  name?: NTAssertionName;

  @Input()
  assertionList!: NTAssertion[];

  protected assertionSuccess: boolean = false;

  ngOnInit(): void {
    this.assertionSuccess = this.transform(this.assertionList, this.type, this.name);
  }

  transform(
    assertions: NTAssertion[],
    type: NTAssertionType | 'all',
    name?: NTAssertionName
  ): boolean {
    let results = true;
    if (type == 'missedEvents' || type == 'all') {
      const missedEvents = assertions.find(isMissedEventsType)!;
      results = results && missedEvents.payload.missedEvents.length == 0;
    }
    if (type == 'runSuccessfullyFinished' || type == 'all') {
      const runSuccessfullyFinished = assertions.find(isRunSuccessfullyFinishedType)!;
      results = results && runSuccessfullyFinished.payload.testSuccessfullyFinished;
    }
    if (type == 'visual' || type == 'all') {
      const visualAssertion = assertions.find(isVisualType)!;
      results = results && visualAssertion.payload.mismatchedPixel.every((value) => value > 60);
    }
    if ((type == 'http' && name == 'status') || type == 'all') {
      const httpAssertion = assertions.find(isHttpStatusType)!;
      results = results && httpAssertion.payload.errorEvents.length == 0;
    }
    if ((type == 'http' && name == 'contentType') || type == 'all') {
      const httpAssertion = assertions.find(isHttpContentType)!;
      results = results && httpAssertion.payload.errorEvents.length == 0;
    }
    if ((type == 'http' && name == 'bodyRequest') || type == 'all') {
      const httpAssertion = assertions.find(isHttpBodyRequestType)!;
      results = results && httpAssertion.payload.errorEvents.length == 0;
    }
    return results;
  }
}
