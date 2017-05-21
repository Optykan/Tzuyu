class Plugin {
  constructor () {
    // define your stuff here
    this.title = 'Plugin skeleton'
    this.desc = 'Provides a skeleton for all plugin instances'
    this.help = 'This is some help text'
  }
  register () {
    // override this method in your plugin
    return {
      trigger: '',
      action: this.handle,
      injects: ''
    }
  }
  handle (...params) {
    // do stuff here
  }
}

module.exports = Plugin
