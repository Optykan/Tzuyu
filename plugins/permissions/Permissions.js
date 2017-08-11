const Plugin = require('../Plugin')

// const PERM_ADMIN = 1
// const PERM_MOD = 2
// const PERM_USER = 3

class Permissions extends Plugin {
  constructor () {
    super()
    this.title = 'Permissions'
    this.desc = 'Does things for moderation'
    // this.help = undefined
    this.enabled = true
  }
  register () {
    return {
      trigger: ['mod'],
      action: [this.handle],
      injects: ['Tzuyu@tzuyu']
    }
  }
  handle (tzuyu, params) {

  }
}

module.exports = Permissions
