import {
  BLCssRuleAddEvent,
  BLCssRuleRemoveEvent,
  BLEvent,
} from "@notest/common";

export class CssDeserializer {
  mappedIndexes = new Map<
    HTMLStyleElement,
    { prevIndex: number; newIndex: number }[]
  >();

  deserialize(e: BLEvent, s: HTMLStyleElement) {
    if ("rule" in e) {
      let ce = e as BLCssRuleAddEvent;
      let newIndex = s.sheet?.insertRule(ce.rule);
      if (!this.mappedIndexes.get(s)) this.mappedIndexes.set(s, []);
      this.mappedIndexes
        .get(s)!
        .push({ prevIndex: ce.index, newIndex: newIndex! });
    } else {
      let ce = e as BLCssRuleRemoveEvent;
      if (this.mappedIndexes.get(s)) {
        let indexes = this.mappedIndexes.get(s)!;
        let indexToRemove = indexes.find((i) => i.prevIndex == ce.index);
        if (indexToRemove && indexToRemove.newIndex >= 0)
          s.sheet?.removeRule(indexToRemove.newIndex);
      }
    }
  }
}
