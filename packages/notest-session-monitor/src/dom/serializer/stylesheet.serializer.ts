import { DomSerializer } from './dom.serializer';
import { DOMSerializerHelper } from './serializer.utils';
import { DOMJson } from '../../model/dom.event';

export class StylesheetDomSerializer implements DomSerializer {
  serialize(n: Node): DOMJson {
    let dsh = new DOMSerializerHelper();
    let { tag, attributes } = dsh.nodeElementTagAttributes(n);
    let css = '';
    if (tag === 'link') {
      return this.serializeLink(n, attributes, dsh);
    } else if (
      tag === 'style' &&
      (n as HTMLStyleElement).sheet &&
      !((n as HTMLElement).innerText || (n as HTMLElement).textContent || '').trim().length
    ) {
      const cssText = getCssRulesString((n as HTMLStyleElement).sheet as CSSStyleSheet);
      if (cssText) {
        css = dsh.getAbsoluteUrlsStylesheet(cssText, location.href);
      }
      return { type: 'style', tag: 'style', attributes, css };
    } else {
      return { type: tag, tag: 'style', attributes, css };
    }
  }

  private serializeLink(n: Node, attributes, dsh: DOMSerializerHelper): DOMJson {
    const stylesheet = Array.from(document.styleSheets).find((s) => {
      return s.href === (n as HTMLLinkElement).href;
    });
    let css = '';
    const cssText = getCssRulesString(stylesheet as CSSStyleSheet);
    if (cssText) {
      delete attributes.rel;
      delete attributes.href;
      css = dsh.getAbsoluteUrlsStylesheet(cssText, stylesheet!.href!);
    }
    return { type: 'link-stylesheet', tag: 'link', attributes, css };
  }
}

function getCssRulesString(s: CSSStyleSheet): string | null {
  try {
    const rules = s.rules || s.cssRules;
    return rules ? Array.from(rules).reduce((prev, cur) => prev + getCssRuleString(cur), '') : null;
  } catch (error) {
    return null;
  }
}

function isCSSImportRule(rule: CSSRule): rule is CSSImportRule {
  return 'styleSheet' in rule;
}

function getCssRuleString(rule: CSSRule): string {
  return isCSSImportRule(rule) ? getCssRulesString(rule.styleSheet) || '' : rule.cssText;
}
