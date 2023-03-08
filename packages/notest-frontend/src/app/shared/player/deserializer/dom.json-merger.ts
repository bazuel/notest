import { BLMutationEventData, DOMJson } from "@notest/common";

function cloneJson(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export class DomJsonMerger {
  debugging = false;

  merge(domJson: DOMJson, mutations: BLMutationEventData[]): DOMJson {
    let json = cloneJson(domJson);
    let nodes = new Map<number, DOMJson>();
    this.updateNodes(json, nodes);
    for (let m of mutations) this.applyMutation(cloneJson(m), nodes);
    return json;
  }

  private updateNodes(json, nodes: Map<number, DOMJson>) {
    exploreWithoutModifying(json, (j) => {
      if (j.id && nodes.has(j.id))
        this.error(`Json with id ${j.id} already present`);
      if (j.id) {
        nodes.set(j.id, j);
        /*if (this.debugging && j.attributes) {
                    j.attributes['data_blid'] = j.id + ''
                }
                 */
      }
      return j;
    });
  }

  private applyMutation(e: BLMutationEventData, nodes: Map<number, DOMJson>) {
    const findElement = (id) => {
      let el = nodes.get(id);
      return el;
    };
    if (e.name == "mutation-add") {
      let parent = findElement(e.parent);
      if (parent == undefined) {
        this.error(
          "Trying to add a node to a non existent parent. ID: " + e.parent
        );
      } else {
        try {
          let indexWhereToInsert = -1;
          let forComparison = 0;
          if (
            parent.children &&
            e.before &&
            parent.children.findIndex((c) => c.id == e.before) >= 0
          ) {
            indexWhereToInsert =
              parent.children.findIndex((c) => c.id == e.before) + 1;
          } else if (
            e.after &&
            parent.children &&
            parent.children.findIndex((c) => c.id == e.after) >= 0
          ) {
            indexWhereToInsert = parent.children.findIndex(
              (c) => c.id == e.after
            );
            forComparison = 1;
          }

          let cIndex = parent.children?.findIndex((c) => c.id == e.id);
          if (
            (cIndex && cIndex < 0) ||
            (indexWhereToInsert >= 0 &&
              cIndex != indexWhereToInsert - forComparison)
          ) {
            if (indexWhereToInsert >= 0 && parent.children)
              parent.children.splice(indexWhereToInsert, 0, e as DOMJson);
            else parent.children?.push(e as DOMJson);

            this.updateNodes(e, nodes);
          } else {
            if (this.debugging) console.log("Child already added", e);
          }
        } catch (err) {
          if (this.debugging) this.error(JSON.stringify(err), e);
        }
      }
    } else if (e.name == "mutation-remove") {
      try {
        let parent = findElement(e.parent);
        if (parent) {
          let tr = findElement(e.id);
          if (!tr) {
            this.error("Trying to remove element not in nodes (and json)");
          }
          let index = parent.children?.findIndex((c) => c.id == e.id) ?? -1;
          if (index < 0)
            this.error("Trying to remove element not in children of parent");
          else {
            parent.children?.splice(index, 1);
            nodes.delete(e.id);
            if (this.debugging) console.log(`Deleting ${e.id}`);
          }
        }
      } catch (e) {
        if (this.debugging) this.error("Could not remove element: ", e);
      }
    } else if (e.name == "mutation-attribute") {
      let element = findElement(e.id);
      //console.log("element: ", element, e)
      if (element && e.attributes) {
        element.attributes = element.attributes ?? {};
        for (let a in e.attributes) {
          element.attributes[a] = e.attributes[a];
        }
      } else if (this.debugging) {
        this.error("Could not find element to apply attribute", e);
      }
    } else if (e.name == "mutation-style") {
      let element = findElement(e.id);
      //console.log("element: ", element, e)
      if (element && e.styles) {
        element.styles = element.styles ?? {};
        for (let a in e.styles) {
          element.styles[a] = e.styles[a];
        }
      } else if (this.debugging) {
        this.error("Could not find element to apply attribute", e);
      }
    } else if (e.name == "mutation-text") {
      let element = findElement(e.id);
      if (element) {
        element.text = e.text;
      } else if (this.debugging) this.error("Could not find text element", e);
    }
  }

  private error(message: string, e?) {
    if (this.debugging) {
      console.warn(message, e);
    }
  }
}

function exploreWithoutModifying(j: DOMJson, action: (d: DOMJson) => DOMJson) {
  const exploreChildren = (children) => {
    if (children)
      children.forEach((c, i) => {
        exploreWithoutModifying(c as any, action);
      });
  };
  exploreChildren(j.children);
  if (j.shadow) exploreChildren(j.shadow.children);
  return action(j);
}
