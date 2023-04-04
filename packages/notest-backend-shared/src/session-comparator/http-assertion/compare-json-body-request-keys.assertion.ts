import { FindSimilarRequestAssertion } from './find-similar-request.assertion';
import { BLHTTPResponseEvent } from '@notest/common';

export class CompareJsonBodyRequestKeysAssertion extends FindSimilarRequestAssertion {
  compare(event1: BLHTTPResponseEvent, event2: BLHTTPResponseEvent) {
    try {
      const unmatchedKeys = [];
      if (typeof event1.request.body === 'string' && typeof event2.request.body === 'string') {
        const jsonBodyEvent1 = JSON.parse(event1.request.body);
        //let jsonBodyKeysEvent1 = Object.keys(jsonBodyEvent1);
        const jsonBodyEvent2 = JSON.parse(event2.request.body);
        //let jsonBodyKeysEvent2 = Object.keys(jsonBodyEvent2);

        //controllo se sono array e non json
        if (Array.isArray(jsonBodyEvent1) && Array.isArray(jsonBodyEvent2)) {
          return true;
        }
        let jsonBodyKeysEvent1 = getAllKeys(jsonBodyEvent1);
        let jsonBodyKeysEvent2 = getAllKeys(jsonBodyEvent2);

        if (jsonBodyKeysEvent1.length != jsonBodyKeysEvent2.length) {
          console.log('Lunghezza diversa delle chiavi', jsonBodyKeysEvent1, jsonBodyKeysEvent2);
          return false;
        }
        //qui sono sicuro che sono json
        for (let key of jsonBodyKeysEvent1) {
          const matchedKey = jsonBodyKeysEvent2.find((value) => value == key);
          if (!matchedKey) {
            unmatchedKeys.push(key);
            console.log(
              'Key non trovata',
              key,
              'body1',
              event1.request.body,
              'body2',
              event2.request.body
            );
          } else {
            jsonBodyKeysEvent2.splice(jsonBodyKeysEvent2.indexOf(matchedKey), 1);
          }
        }
      }
      return unmatchedKeys.length == 0;
    } catch (e) {
      return true;
    }
  }
}
function getAllKeys(jsonObj: { [key: string]: any }): string[] {
  let allKeys: string[] = [];

  if (Array.isArray(jsonObj)) {
    for (const item of jsonObj) {
      allKeys = [...allKeys, ...getAllKeys(item)];
    }
  } else if (typeof jsonObj === 'object' && jsonObj !== null) {
    for (const key of Object.keys(jsonObj)) {
      allKeys.push(key);
      allKeys = [...allKeys, ...getAllKeys(jsonObj[key])];
    }
  }
  return allKeys;
}
