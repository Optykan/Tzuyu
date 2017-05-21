const Plugin = require('./../Plugin')

class Core extends Plugin {
  constructor () {
    super()
    this.title = 'Core plugin support'
    this.desc = 'Provides default module support'
    this.help = 'lord help us all'
  }
  register () {
    return {
      trigger: ['play', 'kill', 'leave', 'skip', 'queue', 'shuffle', 'bump', 'remove'],
      action: [this.play, this.kill, this.kill, this.skip, this.queue, this.shuffle, this.bump, this.remove],
      injects: ['Tzuyu@tzuyu,YouTube@yt,MediaResolver@media', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu', 'Tzuyu@tzuyu']
    }
  }

  play (tzuyu, yt, media, ...params) {
    var request = yt.parsePlayRequest(params.join(' '))
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
    tzuyu.listQueue()
  }
  shuffle (tzuyu) {
    tzuyu.shuffle()
    tzuyu.message('Shuffled queue')
  }
  bump (tzuyu, param1) {
    tzuyu.bump(param1)
  }
  remove (tzuyu, param1) {
    tzuyu.remove(param1)
  }
}

module.exports = Core
