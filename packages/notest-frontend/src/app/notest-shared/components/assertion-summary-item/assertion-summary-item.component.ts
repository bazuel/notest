import { Component, Input, OnInit } from '@angular/core';
import {
  NTAssertion,
  NTAssertionName,
  NTAssertionType,
  NTHttpAssertion,
  NTMissedEventsAssertion,
  NTRunFinishedAssertion,
  NTVisualAssertion
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
      results = results && visualAssertion.payload.mismatchedPixel.every((value) => value === 0);
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

function isRunSuccessfullyFinishedType(
  assertion: NTAssertion
): assertion is NTRunFinishedAssertion {
  return assertion.type === 'runSuccessfullyFinished';
}
export function isMissedEventsType(assertion: NTAssertion): assertion is NTMissedEventsAssertion {
  return assertion.type === 'missedEvents';
}
export function isHttpStatusType(assertion: NTAssertion): assertion is NTHttpAssertion {
  return assertion.type === 'http' && assertion.name === 'status';
}
export function isHttpBodyRequestType(assertion: NTAssertion): assertion is NTHttpAssertion {
  return assertion.type === 'http' && assertion.name === 'bodyRequest';
}
export function isHttpContentType(assertion: NTAssertion): assertion is NTHttpAssertion {
  return assertion.type === 'http' && assertion.name === 'contentType';
}
export function isVisualType(assertion: NTAssertion): assertion is NTVisualAssertion {
  return assertion.type === 'visual';
}
