export class ElidGenerator {

    constructor(private elementsMap: Map<Node, number> = new Map<Node, number>(), private lastId: number = 0) {
    }

    get lastGeneratedId() {
        return this.lastId
    }

    /**
     * Get a Node and returns its ID from the map (or a new ID if the map does not contain it yet)
     * Note that if null is passed as parameter the returned value will be undefined
     * since sometime you can pass the sibling of a node and the sibling does not exist
     * @param t
     */
    id(t: Node | null) {
        if (!t)
            return undefined
        else {
            if (!this.elementsMap.has(t)) {
                this.lastId++
                this.elementsMap.set(t, this.lastId)
            }
            return this.elementsMap.get(t)
        }
    }

    updateLastId(maxId: number) {
        this.lastId = maxId
    }
}