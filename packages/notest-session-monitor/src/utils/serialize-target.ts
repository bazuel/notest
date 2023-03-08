/*
{x,y,height,width,innerText,tag,attributi} */

export function getElementAttributes(element: Element): { [p: string]: string | null } {
  let attributes: { [member: string]: string | null } = {};
  for (const { name, value } of Array.from(element.attributes ?? [])) {
    attributes[name] = value;
  }
  return attributes;
}

export async function getElementRect(element: Element) {
  return new Promise<{ x: number; y: number; width: number; height: number }>((resolve) => {
    const rect = element.getBoundingClientRect();
    resolve({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
  });
}
