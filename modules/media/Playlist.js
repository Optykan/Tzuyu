'use strict'

class Playlist {
  constructor (id) {
    this.id = id
    this.contents = []
  }
  push (song) {
    this.contents.push(song)
  }
  unwrap () {
    return this.contents
  }
}

module.exports = Playlist
