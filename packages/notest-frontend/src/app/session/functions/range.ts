export interface BLRange<T = any> {
    from: number
    to: number
    loading?: boolean
    data?: T[]
}

export function isInsideRange(timestamp: number, range: BLRange): boolean {
    return range.from <= timestamp && timestamp < range.to
}

export function isInsideRanges(timestamp: number, ranges: BLRange[]): boolean {
    return findRange(timestamp, ranges) != undefined
}

export function findRange(timestamp: number, ranges: BLRange[]): BLRange | undefined {
    return ranges.find(r => isInsideRange(timestamp, r))
}

export function findNextRange(timestamp: number, ranges: BLRange[]): BLRange | undefined {
    ranges.sort(r => r.from)
    const found = ranges.filter(r => timestamp <= r.from)
    return found[0]
}

export function findPrevRange(timestamp: number, ranges: BLRange[]): BLRange | undefined {
    ranges.sort(r => r.to)
    const found =  ranges.filter(r => timestamp >= r.to)
    return found[found.length - 1]
}
