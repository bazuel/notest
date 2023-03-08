import { BLMutationEventData } from '../../model/dom.event';

export class StyleAttributeSerializer {
  serialize(target: HTMLElement, oldValue = '') {
    const styles: BLMutationEventData['styles'] = {};
    const tempEl = document.createElement('span');
    tempEl.setAttribute('style', oldValue);
    for (let i = 0; i < target.style.length; i++) {
      let s = target.style[i];
      if (
        target.style.getPropertyValue(s) != tempEl.style.getPropertyValue(s) ||
        target.style.getPropertyPriority(s) != tempEl.style.getPropertyPriority(s)
      ) {
        styles[s] = target.style.getPropertyValue(s);
        if (target.style.getPropertyPriority(s)) styles[s] += ' !important';
      }
    }
    for (let i = 0; i < tempEl.style.length; i++) {
      let s = tempEl.style[i];
      if (target.style.getPropertyValue(s) === '' || !target.style.getPropertyValue(s)) {
        styles[s] = null; // style property was deleted
      }
    }
    return styles;
  }
}
