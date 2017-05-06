'use strict'

class Song {
  constructor (title, id) {
    this.title = title
    this.id = id
  }

  getUrl () {
    return 'https://youtube.com/watch?v=' + this.id
  }
  setTitle (title) {
    this.title = title
  }
  getTitle () {
    return this.title
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
