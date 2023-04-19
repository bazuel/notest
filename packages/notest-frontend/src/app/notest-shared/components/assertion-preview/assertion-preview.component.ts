import { Component, Input, OnInit } from '@angular/core';
import {
  NTAssertion,
  NTAssertionName,
  NTAssertionType,
  NTHttpAssertion,
  NTMissedEventsAssertion,
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

  httpAssertion?: NTHttpAssertion;
  visualAssertion?: NTVisualAssertion;
  missedEventsAssertion?: NTMissedEventsAssertion;

  ngOnInit(): void {
    this.displayAssertion(this.assertionList, this.type, this.name);
  }

  displayAssertion(assertion: NTAssertion[], type: NTAssertionType, name?: NTAssertionName) {
    if (type == 'visual') {
      this.visualAssertion = assertion.find(isVisualType);
    }
    if (type == 'missedEvents') {
      this.missedEventsAssertion = assertion.find(isMissedEventsType);
    }
    if (type == 'http' && name == 'status') {
      this.httpAssertion = assertion.find(isHttpStatusType);
    }
    if (type == 'http' && name == 'contentType') {
      this.httpAssertion = assertion.find(isHttpContentType);
    }
    if (type == 'http' && name == 'bodyRequest') {
      this.httpAssertion = assertion.find(isHttpBodyRequestType);
    }
  }

  protected readonly isHttpStatusType = isHttpStatusType;
}