'use strict'

const ytdl = require('ytdl-core')
const Queue = require('./Queue')
const EventEmitter = require('events')

// should this class handle the queue?

class MediaPlayer {
  // this should handle incoming song objects and play them
  constructor () {
    this.dispatcher = null
    this.streamOptions = {
      seek: 0,
      volume: 0.05
    }
    this.nowPlaying = null
    this.queue = new Queue()
    this.eventEmitter = new EventEmitter()
  }
  _playThroughConnection (song, connection) {
    this.nowPlaying = song
    let stream = ytdl(song.url, {filter: 'audioonly', quality: 'lowest'})
    this.dispatcher = connection.playStream(stream)

    this.dispatcher.on('end', () => {
      this.dispatcher = null
      this.nowPlaying = null
      this._emit('end')
    })
  }

  queue (song) {
    this.queue.enqueue(song)
  }

  bump (index) {
    return this.enqueue.bump(index)
  }

  removeFromQueue (index) {
    return this.enqueue.removeFromQueue(index)
  }

  stop () {
    if (this.dispatcher) {
      this.dispatcher.end()
      this._emit('end')
    }
  }

  skip () {
    if (this.dispatcher) {
      this.dispatcher.end()
      this._emit('end')
    }
  }

  _emit (event) {
    this.eventEmitter.emit(event)
  }

  on (event, callback) {
    this.eventEmitter.on(event, callback.bind())
  }
}

module.exports = MediaPlayer
