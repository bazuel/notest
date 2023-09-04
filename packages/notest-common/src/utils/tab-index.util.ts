export class TabIndex {
  tabIndexes = {}
  currentIndex = -1

  index(t: number) {
    if (this.tabIndexes[t] == null || this.tabIndexes[t] == undefined) {
      this.currentIndex++
      this.tabIndexes[t] = this.currentIndex
    }
    return (this.tabIndexes)[t]

  }
}
