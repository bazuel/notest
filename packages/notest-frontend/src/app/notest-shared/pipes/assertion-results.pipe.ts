import { Pipe, PipeTransform } from '@angular/core';
import { NTAssertion } from '@notest/common';

@Pipe({
  name: 'assertionResults'
})
export class AssertionResultsPipe implements PipeTransform {
  transform(assertion: NTAssertion): boolean {
    let results = Object.values(assertion.assertions).every(Boolean);
    if (assertion.info?.test_execution_failed) results = false;
    return results;
  }
}
