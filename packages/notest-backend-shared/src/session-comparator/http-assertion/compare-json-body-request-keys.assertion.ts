import { BLHTTPResponseEvent } from '@notest/common';

export function compareBodyKeys(event1: BLHTTPResponseEvent, event2: BLHTTPResponseEvent) {
  try {
    const unmatchedKeys = [];
    const jsonBodyEvent1 = JSON.parse(event1.request.body as string);
    const jsonBodyEvent2 = JSON.parse(event2.request.body as string);

    if (Array.isArray(jsonBodyEvent1) && Array.isArray(jsonBodyEvent2)) return true;

    let jsonBodyKeysEvent1 = getAllKeys(jsonBodyEvent1);
    let jsonBodyKeysEvent2 = getAllKeys(jsonBodyEvent2);

    if (jsonBodyKeysEvent1.length != jsonBodyKeysEvent2.length) return false;

    for (let key of jsonBodyKeysEvent1) {
      const matchedKey = jsonBodyKeysEvent2.find((k) => k == key);

      if (!matchedKey) unmatchedKeys.push(key);
      else jsonBodyKeysEvent2.splice(jsonBodyKeysEvent2.indexOf(matchedKey), 1);
    }
    return unmatchedKeys.length == 0;
  } catch (e) {
    return true;
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
