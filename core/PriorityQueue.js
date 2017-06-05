'use strict'
class PriorityQueue {
  constructor () {
    this.queue = []
    this[Symbol.iterator] = function * () {
      let index = 0
      while (index < this.queue.length) {
        yield this.queue[index++]
      }
    }
  }
  push (item, priority) {
    // a priority of 0 is the greatest priority (or negative numbers i guess)
    let toPush = {
      command: item,
      priority: priority
    }
    if (this.queue.length === 0 || this.queue[this.queue.length - 1].priority < priority) {
      this.queue.push(toPush)
    }
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].priority < priority) {
        return this.queue.splice(i, 0, toPush)
      }
    }
    this.queue.push(toPush)
  }
  get (index) {
    return this.queue[index]
  }
  pop () {
    if (this.queue[0]) {
      return this.queue.splice(0, 1)
    }
  }
  peek () {
    if (this.queue[0]) {
      return this.queue[0]
    }
  }
}

module.exports = PriorityQueue
