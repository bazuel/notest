/**
 *
 * Code adapted from https://github.com/ericclemmons/unique-selector
 *
 */
export class ElementSelectorFinder {
  /**
   * Returns a "minimum" unique selector for the element
   * @param element
   */
  findUniqueSelector(element: Element): string {
    if (!element) throw new Error('Element input is mandatory');
    if (!element.ownerDocument) throw new Error('Element should be part of a document');
    let selector = flatSelector(element) + nthChild(element);
    let foundElements = element.ownerDocument.querySelectorAll(selector);
    while (foundElements.length > 1 && element.parentElement) {
      element = element.parentElement;
      let parentSelector = flatSelector(element) + nthChild(element);
      selector = `${parentSelector} > ${selector}`;
      foundElements = element.ownerDocument.querySelectorAll(selector);
    }
    return selector;
  }
}

function nthChild(element: Element) {
  let nthSelector = '';
  const parent = element.parentNode;
  if (parent) {
    let elementSelector = flatSelector(element);
    let children = Array.from(parent.children);
    const brothersHavingSameSelectorCount = children
      .map((c) => flatSelector(c))
      .filter((s) => s == elementSelector);
    if (brothersHavingSameSelectorCount.length > 1) {
      let elementChildIndex = Array.from(parent.children).indexOf(element) + 1; //since nth starts from 1 - not 0
      nthSelector = `:nth-child(${elementChildIndex})`;
    }
  }
  return nthSelector;
}

function attributes(
  element: Element,
  attributesWhiteList = ['name', ' value', 'title', 'for', 'type']
) {
  const attributesSelector: string[] = [];
  const { attributes } = element;
  for (let a of Array.from(attributes)) {
    if (attributesWhiteList.indexOf(a.nodeName.toLowerCase()) > -1) {
      attributesSelector.push(`[${a.nodeName.toLowerCase()}${a.value ? `="${a.value}"` : ''}]`);
    }
  }
  return attributesSelector.join('');
}

/**
 * Returns the selector of the element nont considering any child/parent (i.e. > is never included in this selector)
 * @param element
 */
function flatSelector(element: Element) {
  return tag(element) + id(element) + attributes(element) + classes(element);
}

function classes(element: Element) {
  let classSelectorList: string[] = [];
  if (element.hasAttribute('class')) {
    try {
      const classList = Array.from(element.classList);
      // return only the valid CSS selectors based on RegEx
      classSelectorList = classList.filter((item) =>
        !/^[a-z_-][a-z\d_-]*$/i.test(item) ? null : item
      );
    } catch (e) {
      let className = element.getAttribute('class') ?? '';
      // remove duplicate and leading/trailing whitespaces
      className = className.trim().replace(/\s+/g, ' ');
      // split into separate classnames
      classSelectorList = className.split(' ');
    }
  }
  return classSelectorList.map((c) => '.' + c).join('');
}

function id(element: Element) {
  const id = element.getAttribute('id');
  if (id !== null && id !== '') {
    // if the ID starts with a number or contains ":" selecting with a hash will cause a DOMException
    return id.match(/(?:^\d|:)/) ? `[id="${id}"]` : '#' + id;
  }
  return '';
}

function tag(element: Element) {
  return element.tagName.toLowerCase().replace(/:/g, '\\:');
}

function getParents(el: Node) {
  const parents: Node[] = [];
  let currentElement: Node | null = el;
  while (currentElement && currentElement != el.ownerDocument!.body) {
    parents.push(currentElement);
    currentElement = currentElement.parentNode;
  }
  return parents;
}

function isUnique(el: Element, selector: string) {
  if (!Boolean(selector)) return false;
  const elems = el.ownerDocument.querySelectorAll(selector);
  return elems.length === 1 && elems[0] === el;
}
