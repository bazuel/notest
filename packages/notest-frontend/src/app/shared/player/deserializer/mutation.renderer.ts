import { BLMutationEventData, DOMJsonElement } from "@notest/common";
import { ElementDeserializer } from "./element.deserializer";

export class MutationRenderer {
  render(
    e: BLMutationEventData,
    deserialized: Map<number, Node>,
    deserializer: ElementDeserializer,
    doc: Document,
    options: { debugging: boolean } = { debugging: false }
  ) {
    try {
      const findElement = (id, event?) => {
        let el = deserialized.get(id) as HTMLElement;
        if (!el && event)
          el = deserializer.deserialize(
            event as DOMJsonElement,
            doc
          ) as HTMLElement;
        return el;
      };

      if (e.name == "mutation-add") {
        let parent = findElement(e.parent);
        if (parent == undefined) {
          if (options.debugging) {
            console.warn("Trying to add a node to a non existent parent", e);
          }
        } else {
          let c = findElement(e.id, e);
          let willAddIntoSamePosition = false;
          try {
            let alreadyAddedToParent = c.parentElement == parent;
            if (alreadyAddedToParent) {
              let prevSiblingIsSame =
                !deserialized.get(e.before!) ||
                (deserialized.get(e.before!) &&
                  c.previousSibling &&
                  deserialized.get(e.before!) == c.previousSibling);
              let nextSiblingIsSame =
                !deserialized.get(e.after!) ||
                (deserialized.get(e.after!) &&
                  c.nextSibling &&
                  deserialized.get(e.after!) == c.nextSibling);
              willAddIntoSamePosition = !!(
                prevSiblingIsSame && nextSiblingIsSame
              );
            }

            if (!willAddIntoSamePosition) {
              if (e.before && deserialized.get(e.before)?.parentNode)
                parent.insertBefore(c, deserialized.get(e.before)!.nextSibling);
              else if (e.after && deserialized.get(e.after)?.parentNode)
                parent.insertBefore(c, deserialized.get(e.after)!);
              else parent.appendChild(c);
            }
          } catch (err) {
            if (options.debugging) console.warn(e, err);
          }
        }
      } else if (e.name == "mutation-remove") {
        try {
          let tr = findElement(e.id, e);
          const checkParentInMapRemoval = () => {
            if (e.parent) {
              let parent = deserialized.get(e.parent);
              if (parent) {
                if (parent.contains(tr)) parent.removeChild(tr);
              }
            }
          };
          if (tr.parentNode) {
            tr.parentNode.removeChild(tr);
            // sometimes a node maybe part of a document fragment, so it has "more parents"
            // let's check the map and if it has a parent in the map let's remove it from the "map parent"
            checkParentInMapRemoval();
          } else {
            //this mutation refers to a node that has a parent not yet added to the DOM or a parent that is a document fragment
            // document fragment attached to web components are managed in the web component
            // let's see if the parent exists in the map and use the parent from the map instead
            checkParentInMapRemoval();
          }
        } catch (e) {
          if (options.debugging) console.warn("Could not remove element: ", e);
        }
      } else if (e.name == "mutation-attribute") {
        let element = findElement(e.id, e);
        if (element) {
          for (let a in e.attributes) {
            if (e.attributes[a] === null) {
              if (element.removeAttribute) element.removeAttribute(a);
            } else {
              if (element.setAttribute)
                element.setAttribute(a, e.attributes[a]!);
            }
          }
        } else if (options.debugging) {
          console.warn("Could not find element to apply attribute", e);
        }
      } else if (e.name == "mutation-style") {
        let element = findElement(e.id, e);
        if (element) {
          for (let a in e.styles) {
            if (e.styles[a] === null) {
              element.style.removeProperty(a);
            } else {
              let value = e.styles[a]!;
              let s = e.styles[a];
              let i = "";
              if (value.indexOf("!important") >= 0) {
                s = value.replace(" !important", "").replace("!important", "");
                i = "important";
              }
              element.style.setProperty(a, s, i);
            }
          }
        } else if (options.debugging) {
          console.warn("Could not find element to apply attribute", e);
        }
      } else if (e.name == "mutation-text") {
        let element = findElement(e.id, e);
        if (element) element.textContent = e.text ?? "";
        else if (options.debugging)
          console.warn("Could not find text element", e);
      }
    } catch (err) {
      console.error(err);
      console.log(e, deserialized);
    }
  }
}
