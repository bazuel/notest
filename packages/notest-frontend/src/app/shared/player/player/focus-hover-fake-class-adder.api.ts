export class FocusHoverFakeClassAdderApi {
  private HOVER_SELECTOR = /([^\\]):hover/g;
  private FOCUS_SELECTOR = /([^\\]):focus/g;

  async addHoverRules(iframeDocument: Document, hoverClass = "-fake-class") {
    await this.waitForAllStylesheet(iframeDocument);

    this.createFakeStyleSheet(iframeDocument, iframeDocument);
  }

  createFakeCssRule(
    selectorText: string,
    cssText: string,
    hoverClass = "-fake-class"
  ) {
    if (this.HOVER_SELECTOR.test(selectorText)) {
      const newSelector = selectorText.replace(
        this.HOVER_SELECTOR,
        "$1" + ".hover" + hoverClass
      );
      let css = cssText;
      return { selector: newSelector, css };
    } else if (this.FOCUS_SELECTOR.test(selectorText)) {
      const newSelector = selectorText.replace(
        this.FOCUS_SELECTOR,
        "$1" + ".focus" + hoverClass
      );
      let css = cssText;
      return { selector: newSelector, css };
    } else return { selector: "", css: cssText };
  }

  createFakeStyleSheet(
    target: Document | ShadowRoot,
    doc = document,
    hoverClass = "-fake-class"
  ) {
    if (target.styleSheets) {
      let styles: any[] = [];
      for (let i = 0; i < target.styleSheets.length; i++) {
        styles.push(target.styleSheets.item(i));
      }
      for (let s of styles) {
        let className = (s.ownerNode as any)?.className ?? "";
        if (
          className.indexOf &&
          className.indexOf("bl_focus_hover_fake_style") < 0
        )
          this.createFakeStyleElement(s, doc);
      }
    }
    let newDoc = doc.implementation.createHTMLDocument();
    const styles = target.querySelectorAll(
      "style:not(.bl_focus_hover_fake_style)"
    ) as NodeListOf<HTMLStyleElement>;
    styles.forEach((style: HTMLStyleElement) => {
      if (style.sheet) {
        this.createFakeStyleElement(style.sheet, doc);
      } else {
        let newStyle = style.cloneNode(true);
        newDoc.head.appendChild(newStyle);
        let s = newDoc.querySelector("style");
        if (s?.sheet) this.createFakeStyleElement(s.sheet, doc);
        if (s) newDoc.head.removeChild(s);
      }
    });
  }

  createFakeStyleElement(s, doc) {
    let css: string[] = [];
    try {
      let rules = s.rules || s.cssRules;
      for (let r in rules) {
        let rule = rules[r];
        let cssMediaRule = rule as CSSMediaRule;
        if (cssMediaRule.media) {
          let mediaRule: string[] = [];
          for (let m = 0; m < cssMediaRule.media.length; m++) {
            let media =
              (cssMediaRule.media.item
                ? cssMediaRule.media.item(m)
                : cssMediaRule.media[m]) ?? "";
            mediaRule.push(media);
          }
          const mediaRules: string[] = [];
          let mRules = cssMediaRule.cssRules || [];
          for (let c = 0; c < mRules.length; c++) {
            let r = this.cssRuleText(mRules[c]);
            if (r) mediaRules.push(r);
          }
          if (mediaRules.length > 0)
            css.push(`@media ${mediaRule.join(",")} {
                            ${mediaRules.join("\n")}
                        }`);
        } else {
          let r = this.cssRuleText(rule);
          if (r) css.push(r);
        }
      }
    } catch (e) {
      console.warn(e);
    }
    let style = doc.createElement("style");
    style.className = "bl_focus_hover_fake_style";
    style.appendChild(document.createTextNode(css.join("\n")));
    let ownerNode = s.ownerNode;
    if (ownerNode) ownerNode.parentNode?.insertBefore(style, ownerNode);
  }

  private cssRuleText(rule: CSSRule) {
    const cssRule = this.createFakeCssRule(
      (rule as CSSStyleRule).selectorText,
      rule.cssText
    );
    if (cssRule.selector) {
      const cssRuleText = `${cssRule.selector}, ${cssRule.css}`;
      return cssRuleText;
    }
    return "";
  }

  private async waitForAllStylesheet(iframeDocument: Document) {
    let unloaded = this.unloadedStylesheet(iframeDocument);
    let unloadPromises = unloaded.map(
      (l) => new Promise((r) => (l.onload = r))
    );
    await Promise.all(unloadPromises);
  }

  private unloadedStylesheet(iframeDocument: Document) {
    let unloaded: HTMLLinkElement[] = [];
    let links = iframeDocument.head.querySelectorAll(
      'link[rel="stylesheet"]'
    ) as NodeListOf<HTMLLinkElement>;
    links.forEach((css: HTMLLinkElement) => {
      if (!css.sheet) {
        unloaded.push(css);
      }
    });
    return unloaded;
  }
}
