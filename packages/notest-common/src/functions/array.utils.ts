export function toggle<T>(item: T, items: T[]): boolean {
  const index = items.indexOf(item);
  if (index >= 0) {
    items.splice(index, 1);
    return false;
  } else {
    items.push(item);
    return true;
  }
}
