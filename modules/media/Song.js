'use strict'

class Song {
  constructor (id, title) {
    this.title = title
    this.id = id
  }
  get url () {
    return 'https://youtube.com/watch?v=' + this.id
  }

  resolveTitleFromMessage (message, tries) {
    if (message.embeds[0] && message.embeds[0].title) {
      this.title = message.embeds[0].title
    } else if (!tries || tries < 3) {
      var that = this
      return setTimeout(() => {
        if (!tries) {
          tries = 0
        }
        that.resolveTitleFromMessage(message, tries + 1)
      }, 500)
    }
  }
}

module.exports = Song
