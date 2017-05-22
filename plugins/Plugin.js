class Plugin {
  constructor () {
    // define your stuff here
    this.title = 'Plugin skeleton'
    this.desc = 'Provides a skeleton for all plugin instances'
    this.help = 'This is some help text'
    this.enabled = true
  }
  register () {
    // override this method in your plugin
    return {
      trigger: '',
      action: this.handle,
      injects: '',
      help: this.help
    }
  }
  handle (...params) {
    // do stuff here
  }
}

module.exports = Plugin
