export function getPlaceholderElement(e: { detail: HTMLElement }) {
  const elem = e.detail.cloneNode(true) as HTMLElement;
  const panelWidth = 200;
  const panelHeight = 150;
  const elemWidth = e.detail.offsetWidth;
  const elemHeight = e.detail.offsetHeight;
  const scale = Math.min(panelWidth / elemWidth, panelHeight / elemHeight);
  elem.style.transformOrigin = "top left";
  elem.style.transform = `scale(${scale < 1 ? scale : 1})`;
  const x = document.createElement("div");
  x.textContent = "✖";
  x.style.top = "0";
  x.style.right = "0";
  x.style.position = "absolute";
  x.style.cursor = "pointer";
  x.style.color = "red";
  x.style.fontSize = "20px";
  x.style.fontWeight = "bold";
  elem.style.boxShadow = "0 10px 15px -3px #9ca3af, 0 4px 6px -4px #9ca3af";
  elem.style.marginLeft = "0px";
  elem.style.marginTop = "0px";
  elem.style.marginRight = "0px";
  elem.style.marginBottom = "0px";
  elem.style.margin = "5px";
  elem.style.display = "flex";
  elem.style.justifyContent = "center";
  elem.style.alignItems = "center";
  elem.style.borderRadius = "5px";
  elem.style.padding = "5px";
  elem.style.cursor = "pointer";
  elem.appendChild(x);
  return elem;
}