'use strict'
const YouTube = require('./../YouTube')
const MediaResolvable = require('./MediaResolvable')

class MediaResolver {
  static resolve (mediaResolvable) {
    if (!(mediaResolvable instanceof MediaResolvable)) {
      throw new TypeError('Passed an instance of ' + mediaResolvable.constructor.name)
    }

    if (mediaResolvable.isVideo()) {
      return YouTube.getTitle(mediaResolvable.payload).then(title => {
        return new Promise((resolve, reject) => {
          mediaResolvable.title = title
          resolve(mediaResolvable.resolve())
        })
      })
    } else if (mediaResolvable.isPlaylist()) {
      var pl = mediaResolvable.resolve()
      return YouTube.parsePlaylist(pl.id, pl).then((playlist) => {
        return new Promise((resolve, reject) => {
          resolve(playlist)
        })
      })
    } else if (mediaResolvable.isSearch()) {
      return YouTube.search(mediaResolvable.payload).then(resolvable => {
        return new Promise((resolve, reject) => {
          // resolve the promise (then = res) with a call to resolve (static resolve) with the resolvable
          resolve(MediaResolver.resolve(resolvable))
        })
      })
    }
  }
}

module.exports = MediaResolver
