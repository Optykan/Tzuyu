'use strict'

const Song = require('./Song')
const Playlist = require('./Playlist')

class MediaResolvable {
  constructor (type, payload, title, target) {
    // type: youtube#<type>
    // payload: either an id or a search
    this.title = title
    this.type = type
    this.payload = payload
    this.target = 'yt'
  }
  resolve () {
    if (this.isVideo()) {
      return new Song(this.title, this.payload)
    } else if (this.isPlaylist()) {
      return new Playlist(this.payload)
    }
  }
  isVideo () {
    return this.type.search('video') !== -1
  }
  isPlaylist () {
    return this.type.search('playlist') !== -1
  }
  isSearch () {
    return this.type.search('search') !== -1
  }
}

module.exports = MediaResolvable
