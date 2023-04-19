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
import {
  isHttpBodyRequestType,
  isHttpContentType,
  isHttpStatusType,
  isMissedEventsType,
  isVisualType
} from '../assertion-summary-item/assertion-summary-item.component';
@Component({
  selector: 'nt-assertion-preview',
  templateUrl: './assertion-preview.component.html',
  styleUrls: ['./assertion-preview.component.scss']
})
export class AssertionPreviewComponent implements OnInit {
  @Input()
  assertionList!: NTAssertion[];
  @Input()
  title!: string;
  @Input()
  type!: NTAssertionType;
  @Input()
  name?: NTAssertionName;

  private assertionSelected: NTAssertion = {} as NTAssertion;
  ngOnInit(): void {}
  displayAssertion(assertion: NTAssertion[], type: NTAssertionType, name?: NTAssertionName) {
    if (type == 'visual') {
      const visualAssertion = assertion.find(isVisualType);
      return visualAssertion;
    }
    if (type == 'missedEvents') {
      const missedEvents = assertion.find(isMissedEventsType);
      return missedEvents;
    }
    if (type == 'http' && name == 'status') {
      const httpStatusEvents = assertion.find(isHttpStatusType);
      return httpStatusEvents;
    }
    if (type == 'http' && name == 'contentType') {
      const httpContentTypeEvents = assertion.find(isHttpContentType);
      return httpContentTypeEvents;
    }
    if (type == 'http' && name == 'bodyRequest') {
      const httpBodyRequestEvents = assertion.find(isHttpBodyRequestType);
      return httpBodyRequestEvents;
    }
    return undefined;
  }
}
