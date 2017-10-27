const Plugin = require('../Plugin')

class LeagueOfLegends extends Plugin {
  constructor () {
    super()
    this.title = 'League of Legends'
    this.desc = '???'
    this.help = 'Woops! It looks like what you searched for is missing. Check back again later!'
    this.enabled = false
  }
  register () {
    return {
      trigger: ['search'],
      action: [this.search],
      injects: ['Tzuyu@tzuyu'],
      help: {
        search:"Active game lookup"
      }
    }
  }

  search (summ, region) {
    return summ
  }

}

module.exports = LeagueOfLegends // more like plugin.exports haha end me
