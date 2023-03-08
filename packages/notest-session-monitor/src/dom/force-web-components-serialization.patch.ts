export class ForceWebComponentsSerializationPatch {
  apply() {
    const { attachShadow } = Element.prototype;
    Element.prototype.attachShadow = function () {
      let sh = attachShadow.apply(this, arguments as any);
      (this as any)._closed_mode_shadowRoot = sh;
      return sh;
    };
  }
}
