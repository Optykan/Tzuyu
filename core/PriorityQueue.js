'use strict'
class PriorityQueue {
  constructor () {
    this.queue = []
    this.index = 0
    this[Symbol.iterator] = function * () {
      let index = 0
      while (index < this.queue.length) {
        yield this.queue[index++]
      }
    }
  }
  
  next(){
    if(this.index >= this.length){
      return null
    }
    let res = this.get(this.index)
    
    this.index++

    return res
  }

  done(){
    this.index=0
  }

  get length () {
    return this.queue.length
  }

  push (item, priority) {
    // a larger priority means it will be run first
    let toPush = {
      command: item,
      priority: priority
    }
    if (this.queue.length === 0 || this.queue[this.queue.length - 1].priority > priority) {
      this.queue.push(toPush)
    }else if(priority > this.queue[0].priority){
      this.queue.splice(0, 0, toPush)
    }
    for (let i = 0; i < this.queue.length-1; i++) {
      if (this.queue[i+1].priority < priority) {
        return this.queue.splice(i+1, 0, toPush)
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
