const Plugin = require('./../Plugin')
const Discord = require('discord.js')

class MediaCore extends Plugin {
  constructor () {
    super()
    this.title = 'Core plugin support'
    this.desc = 'Provides default module support'
    this.help = 'lord help us all'
    this.enabled = true
  }
  register () {
    return {
      trigger: ['play', 'kill', 'leave', 'skip', 'queue', 'shuffle', 'bump', 'remove'],
      action: [this.play, this.kill, this.kill, this.skip, this.queue, this.shuffle, this.bump, this.remove],
      injects: ['Tzuyu@tzuyu,YouTube@yt,MediaResolver@media,Message@message', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu'],
      help: {
        play: 'Accepts a string to search for, or a full youtube URL',
        kill: 'Clears the queue and leaves the channel',
        leave: 'Clears the queue and leaves the channel',
        skip: 'Skips the currently playing song',
        queue: 'Lists the queue',
        shuffle: 'Shuffles the queue',
        bump: 'Format: `bump n` where `n` is any valid number. Bumps said song to the front of the queue',
        remove: 'Format: `remove n` where `n` is any valid number. Removes said song from the queue'
      }
    }
  }

  play (tzuyu, yt, media, message, ...params) {
    if (!message.member || !message.member.voiceChannelID) {
      return false
    }
    tzuyu.setVoiceChannel(message.member.voiceChannelID)
    let request = yt.parsePlayRequest(params.join(' '))
    media.resolve(request).then(media => {
      tzuyu.play(media)
    }).catch(console.error)
  }
  kill (tzuyu) {
    tzuyu.leave()
  }
  skip (tzuyu) {
    tzuyu.skip()
  }
  queue (tzuyu) {
    let q = tzuyu.returnQueue()
    if (!q) {
      return tzuyu.message('Queue is empty')
    }

    let embed = new Discord.RichEmbed()
      .setTitle('Queue: ')
      .setColor(0x2ecc71)
    var description = ''

    let upperPages = Math.ceil((q.length) / 25)
    for (var j = 0; j < upperPages; j++) {
      for (let i = j * 25; i < (j * 25) + 25; i++) {
        if (!q[i]) { break }

        description += (i + 1).toString() + '. **' + q[i].title + '**\n'
      }
      embed.setDescription(description)
      embed.setFooter('Page: ' + (j + 1) + ' of ' + upperPages + ' - Total: ' + q.length)
      tzuyu.message({embed})
      description = ''
    }
  }
  shuffle (tzuyu) {
    tzuyu.shuffle()
    tzuyu.message('Shuffled queue')
  }
  bump (tzuyu, param1) {
    tzuyu.bump(param1)
  }
  remove (tzuyu, param1) {
    tzuyu.removeFromQueue(param1)
  }
}

module.exports = MediaCore
