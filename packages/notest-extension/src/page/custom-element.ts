class ExtensionElement extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = '<div id="--nt-widget"></div>';
  }
}

customElements.define('notest-widget', ExtensionElement);
document.body.appendChild(new ExtensionElement());

console.log('adding widget');
