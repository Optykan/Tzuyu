const Plugin = require('./../Plugin')

class Configure extends Plugin {
  constructor () {
    super()
    this.title = 'Configure Tzuyu plugin package'
    this.desc = 'Provides configure support'
    this.help = 'Configure stuff'
  }
  register () {
    return {
      trigger: 'config',
      action: this.handle,
      injects: 'Tzuyu@tzuyu',
      help: this.help
    }
  }
  handle (tzuyu, setting, value) {
    if (setting && value) {
      if (tzuyu.config[setting]) {
        tzuyu.config[setting] = value
        tzuyu.message('Set ' + setting + ' to ' + value)
      } else {
        tzuyu.message('Configuration parameter not found')
      }
    } else {
      tzuyu.message('Invalid parameters passed')
    }
  }
}

module.exports = Configure
