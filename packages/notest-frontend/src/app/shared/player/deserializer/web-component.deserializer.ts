import { DomDeserializer } from "./dom.deserializer";
import { ElementDeserializer } from "./element.deserializer";
import { DOMDeserializerHelper } from "./deserializer.utils";
import { FocusHoverFakeClassAdderApi } from "../player/focus-hover-fake-class-adder.api";
import {
  DOMJsonElement,
  MethodObserverOptions,
  observeMethod,
} from "@notest/common";

export class WebComponentDomDeserializer implements DomDeserializer {
  constructor(private elementDomSerializer: ElementDeserializer) {}

  deserialize(json: DOMJsonElement, doc: Document): Node {
    let deserialize = (c) => this.elementDomSerializer.deserialize(c, doc);
    let w = doc.createElement(json.tag);
    let shadow = json.shadow;
    let documentFragment = new DocumentFragmentSupporter(deserialize);
    let isDocumentFragment = documentFragment.isDocumentFragment(json);
    if (shadow) {
      if (!w.shadowRoot) {
        if (isDocumentFragment) {
          documentFragment.linkTo(w, json);
        } else w.attachShadow({ mode: shadow.mode });
      }
      if (shadow.style && w.shadowRoot) {
        let style = doc.createElement("style");
        style.innerHTML = shadow.style;
        w.shadowRoot.appendChild(style);
      }

      if (!isDocumentFragment && shadow.children && w.shadowRoot)
        for (let c of shadow.children) {
          w.shadowRoot.appendChild(deserialize(c));
        }

      if (w.shadowRoot) {
        // styles inside a shodow root are isolated from the document,
        // so fake hover and focus should be computed here
        new FocusHoverFakeClassAdderApi().createFakeStyleSheet(
          w.shadowRoot,
          doc
        );
      }
    }
    new DOMDeserializerHelper().applyAttributes(w, json);
    return w;
  }
}

/*
Document fragment is often used as a polyfill to shadow dom, ex. in the SalesFocrce lightining framework.
When adding a document fragment to an element, all its children get added to the element.
A document fragment in same framework is live and adding children to it will add the to the parent element.
Here we link the fragment to its parent to accomplish this behaviour during deseralization.
 */
class DocumentFragmentSupporter {
  constructor(private deserialize: (c) => any) {}

  isDocumentFragment(json: DOMJsonElement) {
    return json.shadow?.shadowType == "document-fragment";
  }

  linkTo(w: HTMLElement, json: DOMJsonElement) {
    let fragment = this.deserialize(json.shadow!.documentFragment);
    // after deserialization, same nodes could be added to the fragment,
    // so let's add them to the web component since the method observation is not set yet
    w.appendChild(fragment);
    observeMethod(fragment, "appendChild", (...args) => {
      let options: MethodObserverOptions = args[args.length - 1];
      options.override = () => {
        w.appendChild(args[0]);
      };
    });
    observeMethod(fragment, "insertBefore", (...args) => {
      let options: MethodObserverOptions = args[args.length - 1];
      options.override = () => {
        w.insertBefore(args[0], args[1]);
      };
    });
    observeMethod(fragment, "removeChild", (...args) => {
      let options: MethodObserverOptions = args[args.length - 1];
      options.override = () => {
        w.removeChild(args[0]);
      };
    });
    Object.defineProperty(w, "shadowRoot", { value: fragment });
  }
}
