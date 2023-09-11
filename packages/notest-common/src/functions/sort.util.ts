export function byTimestamp(
  t1: { timestamp: number },
  t2: { timestamp: number }
) {
  return t1.timestamp - t2.timestamp;
}

export function byTimestampDesc(
  t1: { timestamp: number },
  t2: { timestamp: number }
) {
  return t2.timestamp - t1.timestamp;
}
