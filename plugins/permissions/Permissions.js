const Plugin = require('../Plugin')

const PERM_ADMIN = 0
const PERM_MOD = 1
const PERM_USER = 2

class Permissions extends Plugin{
  constructor () {
    super()
    this.title = 'Help module'
    this.desc = 'A module that provides help text for everything'
    this.help = '...really?'
    this.enabled = true
  }
  register () {
    return {
      trigger: '*',
      action: this.handle,
      injects: 'Tzuyu@tzuyu'
    }
  }
  handle(tzuyu, params){

  }
}

module.exports = Permissions