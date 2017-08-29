const Command = require('./Command')

class User {
  constructor () {
    return this
  }
  can (command) {
    if (!(command instanceof Command)) {
      throw new TypeError('Expected an instance of Command, got ' + typeof command)
    }
    return this.permission >= command.permission && this.serverId === command.serverId
  }
  fromDatabase (db) {
    this.id = db.user_id
    this.serverId = db.server_id
    this.permission = db.permission
    return this
  }
  fromParams (id, permission, server) {
    this.id = id
    this.permission = permission
    this.serverId = server
    return this
  }
}

module.exports = User
