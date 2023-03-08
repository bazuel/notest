let backX = false;
let backY = false;

export function getSelectorRect(
  x: number,
  y: number,
  selectorRect: { left: number; top: number; width: number; height: number }
) {
  let { left, top } = selectorRect;
  let right = left + selectorRect.width;
  let bottom = top + selectorRect.height;

  if (x > right) {
    right = x;
    backX = false;
  } else if (x < left) {
    left = x;
    backX = true;
  } else if (backX) {
    left = x;
  } else {
    right = x;
  }
  if (y > bottom) {
    bottom = y;
    backY = false;
  } else if (y < top) {
    top = y;
    backY = true;
  } else if (backY) {
    top = y;
  } else {
    bottom = y;
  }
  return { left, top, width: right - left, height: bottom - top };
}

export function getHighlighterRect(targetList: HTMLElement[]) {
  const boundary = targetList
    .map((target) => {
      const rect = target.getBoundingClientRect();
      const left = rect.left;
      const top = rect.top;
      const width = rect.width;
      const height = rect.height;
      return {
        minCorner: { left, top },
        maxCorner: { right: left + width, bottom: top + height },
      };
    })
    .reduce(
      (acc, curr) => {
        const minCorner = {
          left: Math.min(acc.minCorner.left, curr.minCorner.left),
          top: Math.min(acc.minCorner.top, curr.minCorner.top),
        };
        const maxCorner = {
          right: Math.max(acc.maxCorner.right, curr.maxCorner.right),
          bottom: Math.max(acc.maxCorner.bottom, curr.maxCorner.bottom),
        };
        return { minCorner, maxCorner };
      },
      {
        minCorner: { left: Infinity, top: Infinity },
        maxCorner: { right: 0, bottom: 0 },
      }
    );
  return {
    left: boundary.minCorner.left,
    top: boundary.minCorner.top,
    width: boundary.maxCorner.right - boundary.minCorner.left,
    height: boundary.maxCorner.bottom - boundary.minCorner.top,
  };
}

export function renderElement(
  element: HTMLElement,
  rect: { top: number; left: number; width: number; height: number }
) {
  if (!element) return;
  element.style.top = rect.top + "px";
  element.style.left = rect.left + "px";
  element.style.width = rect.width + 5 + "px";
  element.style.height = rect.height + 5 + "px";
}
