export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  target: Document | Window = document
) {
  const options = { capture: true, passive: true };
  if (target) target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}
