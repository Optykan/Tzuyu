class Command {
  constructor(){
    return this
  }
  fromParams (trigger, permission, roleId, serverId) {
    this.trigger = trigger
    this.permission = permission
    this.roleId = roleId
    this.serverId = serverId
    return this
  }
  fromDatabase(db){
    this.trigger = db.trigger
    this.permission = db.permission
    this.roleId = db.role_id
    this.serverId = db.server_id
    return this
  }

}

module.exports = Command
