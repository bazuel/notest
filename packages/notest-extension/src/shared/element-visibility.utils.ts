export function setVisibility(element: HTMLElement, visible: boolean) {
  if (visible) element.style.display = 'flex';
  else element.style.display = 'none';
}
