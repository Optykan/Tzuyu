const Command = require('./Command')

class User{
  can(command){
    return this.permission >= command.permission && this.serverId === command.serverId
  }
  fromDatabase(db){
    this.id = db.user_id
    this.serverId = db.server_id
    this.permission = db.permission
  }
  fromParams(id, permission, server){
    this.id = id
    this.serverId = permission
    this.permission = server
  }
}

module.exports = User