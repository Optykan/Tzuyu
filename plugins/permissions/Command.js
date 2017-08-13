class Command{
	constructor(trigger, permission, roleId, serverId){
    this.trigger=trigger
    this.permission=permission
    this.roleId=roleId
    this.serverId=serverId
  }
}

module.exports = Command