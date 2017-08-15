'use strict'

const Plugin = require('../Plugin')
const PermissionManager = require('./PermissionManager')

const PERM_ADMIN = 3
const PERM_MOD = 2
const PERM_USER = 1

class Permissions extends Plugin {
  constructor () {
    super()
    this.title = 'Permissions'
    this.desc = 'Does things for moderation'
    // this.help = undefined
    this.enabled = true
    this.permissionManager = new PermissionManager()

    this.current = {
      user: {},
      command: {}
    }
  }
  register () {
    return {
      trigger: ['*', 'mod', 'perms_generateTables', 'restrict'],
      action: [this.checkPermission, this.mod, this.initialize, this.restrict],
      injects: ['Trigger@trigger,Tzuyu@tzuyu,Message@message,Database@database', 'Tzuyu@tzuyu,Database@database', 'Database@database,Tzuyu@tzuyu,Message@message', 'Message@message'],
      priority: [0, 10, 10, 10],
      help: {
        '*': ' - ',
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

  checkPermission (trigger, tzuyu, message, database, target) {
    //always implicity called through the * command trigger
    let author = message.author.id
    let server = message.member.guild.id

    console.log('SERVER: '+server)
    

    var waiting = true

    var that = this
    this.permissionManager.forceAsync(function * () {
      console.log('SERVER (generator): '+server)
      let user = yield that.permissionManager.getUser(database, author, server)
      let command = yield that.permissionManager.getCommand(database, trigger, server)

      if(user.can(command)){
        waiting = false
        that.current.user = user
        that.current.command = command
      }else{
        throw new PermissionError('User has insufficient privileges')
      }
    })

    let waitLoop = () => {
      if(waiting){
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    }

    waitLoop()
    console.log('done')
  }

  mod (tzuyu, database, target) {
    let id = this._getIdFromMessage(target)
    console.log(this.current)
    console.log('SERVER (mod): '+this.current.user.serverId)
    this.permissionManager.getUser(database, id, this.current.user.serverId).then(user=>{
      user.permission = PERM_MOD
      this.permissionManager.save(user).then(res=>{
        tzuyu.message('Request successful...')
      })
    }).catch(e=>{
      console.error(e)
    })
  }
  restrict (message, level) {
    console.log('body')
  }
}

module.exports = Permissions
