'use strict'

const Discord = require('discord.js')
const Song = require('./media/Song')
const Playlist = require('./media/Playlist')
const MediaPlayer = require('./MediaPlayer')

class Bot {
  constructor () {
    this.voice = {
      channel: null
    }
    this.text = {
      channel: null
    }
    this.connection = null
    this.client = new Discord.Client()
    this.config = {
      messageDelay: 15000
    }
    this.isConnecting = false

    this.permlist = {
      users: [116399321661833218, 304780284077801472],
      isActive: true,
      type: 'blacklist'
    }
    this.mediaPlayer = new MediaPlayer()
    this.mediaPlayer.on('start', song => {
      this.message('Now playing: ' + song.title)
      this.setPlaying(song.title)
    })
    this.mediaPlayer.on('finished', () => {
      this.message('Queue is empty, leaving...')
      this.stop()
    })
  }

  addToPermlist (id) {
    this.permlist.users.push(id)
  }

  isPermitted (id) {
    if (this.permlist.isActive) {
      if (this.permlist.type === 'whitelist') {
        return this.permlist.users.includes(id)
      } else {
        return !this.permlist.users.includes(id)
      }
    } else {
      return true
    }
  }
  setPermlistStatus (status) {
    this.permlist.type = status
  }

  join (id) {
    if (!this.voice.connection) {
      this.isConnecting = true
      if (!id) {
        return this.voice.channel.join()
      } else {
        this.voice.channel = this.client.channels.get(id)
        return this.voice.channel.join()
      }
    }
  }

  leave () {
    this.mediaPlayer.dumpQ()
    if (this.dispatcher) {
      this.dispatcher.end()
    }
    if (this.connection) {
      this.voice.channel.leave()
      this.connection = null
    } else {
      // check to see if it died
      const conns = this.client.voiceConnections.array()
      // console.log(conns);
      if (conns.length > 0) {
        for (var i = conns.length - 1; i >= 0; i--) {
          conns[i].leave()
        };
      }
    }
    this.setPlaying('Overwatch') // well...
  }

  message (m, options, callback) {
    this.text.channel.send(m).then(message => {
      if (typeof callback === 'function') {
        callback(message)
      }
      let delay = (options ? (options.messageDelay || this.config.messageDelay) : this.config.messageDelay)
      if (delay > 0) {
        message.delete(delay)
      }
    }).catch(console.error)
  }

  _ensureConnectionAfterRequest () {
    if (!this.connection && !this.isConnecting) {
      console.log('No connection, connecting...')

      this.join().then(conn => {
        this.connection = conn
        this.isConnecting = false
        this.mediaPlayer.provideConnection(conn)
        this.mediaPlayer.play()
      }).catch(e => {
        console.error(e)
        this.leave()
      })
    } else {
      // var latest = this.queue.peekLast()
      // do something...
    }
  }

  play (input) {
    if (input instanceof Song || input instanceof Playlist) {
      if (input instanceof Song) {
        this.message('Added ' + input.title + ' to queue at position ' + parseInt(this.mediaPlayer.getQueueLength() + 1))
        this.mediaPlayer.enqueue(input)
      } else if (input instanceof Playlist) {
        this.message('Adding playlist to queue...')
        this.mediaPlayer.enqueue(input)
      }
      this._ensureConnectionAfterRequest()
    } else {
      throw new TypeError('Item passed to play was an instance of ' + input.constructor.name)
    }
  }
  stop () {
    this.mediaPlayer.stop()
    this.leave()
  }
  skip () {
    this.mediaPlayer.skip()
  }
  listQueue () {
    var output = ''

    if (this.mediaPlayer.isQueueEmpty()) {
      return this.message('Queue is empty')
    }
    var q = this.mediaPlayer.returnQueue()

    for (var j = 0; j < Math.ceil((q.length) / 25); j++) {
      for (let i = j * 25; i < (j * 25) + 25; i++) {
        if (!q[i]) { break }

        output += (i + 1).toString() + '. **' + q[i].title + '**\n'
      }
      this.message(output)
      output = ''
    }
  }
  bump (songIndex) {
    let t = parseInt(songIndex)
    if (!isNaN(t) && t > 0) {
      let res = this.mediaPlayer.bump(t)
      if (res !== false && res instanceof Song) {
        this.message('Bumped ' + res.title + ' to front of queue')
      } else {
        this.message('No song found at index `' + t + '`')
      }
    } else {
      this.message('Invalid song index provided')
    }
  }
  removeFromQueue (songIndex) {
    let t = parseInt(songIndex)
    if (!isNaN(t) && t > 0) {
      let res = this.mediaPlayer.removeFromQueue(t)
      if (res !== false && res instanceof Song) {
        this.message('Removed ***' + res.title + '*** from the queue')
      } else {
        this.message('No song found at index `' + t + '`')
      }
    } else {
      this.message('Invalid song index provided')
    }
  }
  shuffle () {
    this.mediaPlayer.shuffle()
  }
  setPlaying (status) {
    this.client.user.setGame(status)
  }
  setStatus (status) {
    this.client.user.setStatus(status)
  }
  setVoiceChannel (chanID) {
    this.voice.channel = this.client.channels.get(chanID)
  }
  setTextChannel (chanID) {
    this.text.channel = this.client.channels.get(chanID)
  }
  setMessageDeleteDelay (i) {
    if (!isNaN(parseInt(i))) {
      this.config.messageDelay = parseInt(i)
      return true
    }
    return false
  }
  login (token) {
    this.client.login(token)
  }
}

module.exports = Bot
