'use strict'

const ytdl = require('ytdl-core')
const Queue = require('./Queue')
const EventEmitter = require('events')
const Playlist = require('./media/Playlist')
// const Song = require('./media/Song')

// should this class handle the queue?

class MediaPlayer {
  // this should handle incoming song objects and play them
  constructor () {
    this.dispatcher = null
    this.connection = null
    this.streamOptions = {
      seek: 0,
      volume: 0.5
    }
    this.nowPlaying = null
    this.queue = new Queue()
    this.eventEmitter = new EventEmitter()
  }
  play () {
    if (!this.queue.isEmpty()) {
      let current = this.queue.dequeue()
      this.nowPlaying = current
      this._emit('start', current)

      let stream = ytdl(current.url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 })
      this.dispatcher = this.connection.playOpusStream(stream)

      this.dispatcher.on('end', () => {
        if (!this.queue.isEmpty()) {
          this._emit('end')
          this.play()
        } else {
          this.dispatcher = null
          this.nowPlaying = null
          this._emit('finished')
        }
      })
    }
  }

  getQueueLength () {
    return this.queue.getLength()
  }

  shuffle () {
    this.queue.shuffle()
  }

  enqueue (input) {
    if (input instanceof Playlist) {
      this.queue.concat(input.unwrap())
    } else {
      this.queue.enqueue(input)
    }
  }

  provideConnection (conn) {
    this.connection = conn
  }

  bump (index) {
    return this.queue.bump(index)
  }

  removeFromQueue (index) {
    return this.queue.removeFromQueue(index)
  }

  dumpQ () {
    this.queue.dumpQ()
  }

  stop () {
    if (this.dispatcher) {
      this.dispatcher.end()
    }
  }

  skip () {
    if (this.dispatcher) {
      this.dispatcher.end()
      this._emit('skip')
    }
  }

  returnQueue () {
    return this.queue.returnQ()
  }

  isQueueEmpty () {
    return this.queue.isEmpty()
  }

  _emit (event, ...args) {
    this.eventEmitter.emit(event, ...args)
  }

  on (event, callback) {
    this.eventEmitter.on(event, callback)
  }
}

module.exports = MediaPlayer
