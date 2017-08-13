const Command = require('./Command')

class User{
	constructor(id, serverId, permission){
    this.id=id
    this.serverId=serverId
    this.permission=permission
	}
  can(command){
    return this.permission >= command.permission && this.serverId === command.serverId
  }
}