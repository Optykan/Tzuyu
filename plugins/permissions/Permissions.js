'use strict'

const Plugin = require('../Plugin')
const PermissionManager = require('./PermissionManager')

class Permissions extends Plugin {
  constructor () {
    super()
    this.title = 'Permissions'
    this.desc = 'Does things for moderation'
    // this.help = undefined
    this.enabled = true
    this.permissionManager = new PermissionManager()
  }
  register () {
    return {
      trigger: ['*', 'mod', 'perms_generateTables', 'restrict'],
      action: [this.checkPermission, this.mod, this.initialize, this.restrict],
      injects: ['Trigger@trigger,Tzuyu@tzuyu,Message@message,Database@database', 'Tzuyu@tzuyu,Message@message,Database@database', 'Database@database,Tzuyu@tzuyu,Message@message', 'Message@message'],
      help: {
        mod: 'Format: `mod @user`. Gives a user elevated privileges, granting them the ability to access restricted commands (restricted: mod)',
        perms_generateTables: 'Generates the tables required for the Permissions plugin to work. Run this once (restricted: server owner)',
        restrict: 'Format: `restrict <command>`, where <command> does not include the prefix (!, &, whatever is set). Only allows moderators to use these commands (restricted: mod)'
      }
    }
  }
  initialize (database, tzuyu, message) {
    tzuyu.message('Creating tables...')
    this.permissionManager.initialize(database, message).then(res => {
      tzuyu.message('Done')
    }).catch(err => {
      tzuyu.message('An error occured: ' + err.message)
    })
  }

  _getIdFromMessage (message) {
    let res = /<@([0-9]{18})>/.exec(message)
    if (res) {
      return res[1]
    }
    throw new Error('Could not resolve ID of user')
  }
  _modAfterSearch (tzuyu, source, msgTarget) {
    try {
      var target = this._getIdFromMessage(msgTarget)
    } catch (e) {
      console.error(e)
      return tzuyu.message(e.message)
    }
  }

  checkPermission(trigger, tzuyu, message, database, target){
    let author = message.author.id
    let server = message.member.guild.id

    var user = {}
    var command = {}

    var that = this

    return new Promise((resolve, reject)=>{
      this.permissionManager.forceAsync(function * () {
        user = yield that.permissionManager.getUser(database, author, server)
        command = yield that.permissionManager.getCommand(database, trigger, server)

        if(user.can(command)){
          resolve(true)
        }else{
          throw new PermissionError('User has insufficient privileges')
        }
      })
    })
  }

  mod (tzuyu, message, database, target) {

  }
  restrict (message, level) {
    console.log('body')
  }
}

module.exports = Permissions
