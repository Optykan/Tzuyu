'use strict'

const Plugin = require('../Plugin')
const PermissionManager = require('./PermissionManager')
const PermissionError = require('./PermissionError')

const PermissionLevel = require('./PermissionLevel')

class Permissions extends Plugin {
  constructor () {
    super()
    this.title = 'Permissions'
    this.desc = 'Does things for moderation'
    // this.help = undefined
    this.enabled = true
    this.permissionManager = new PermissionManager()

    // the current running command
    this.current = {
      user: {},
      command: {}
    }
  }

  register () {
    return {
      trigger: ['*', 'mod', 'perms_generateTables', 'restrict'],
      action: [this.checkPermission, this.mod, this.initialize, this.restrict],
      injects: ['Trigger@trigger,Tzuyu@tzuyu,Message@message,Database@database,CommandDelegator@delegator', 'Tzuyu@tzuyu,Database@database', 'Database@database,Tzuyu@tzuyu,Message@message', 'Tzuyu@tzuyu,Database@database'],
      priority: [99, 10, 10, 10],
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

  checkPermission (trigger, tzuyu, message, database, delegator, target) {
    // always implicity called through the * command trigger
    let author = message.author.id
    let server = message.member.guild.id

    if (!delegator.isTriggerRegistered(trigger)) {
      // buddy that isnt even a legit command
      return false
    }

    console.log('SERVER: ' + server)

    return new Promise((resolve, reject) => {
      this.permissionManager.getUser(database, author, server).then(user => {
        this.current.user = user
        this.permissionManager.getCommand(database, trigger, server).then(command => {
          this.current.command = command
          if (this.current.user.can(this.current.command)) {
            resolve()
          } else {
            // tzuyu.message('You do not have permission to perform this command', {messageDelay: -1})
            reject(new PermissionError('User has insufficient privileges to perform ' + trigger))
          }
        })
      })
    })
  }

  mod (tzuyu, database, target) {
    // console.log('RUNNING MOD')
    let id = this._getIdFromMessage(target)
    return new Promise((resolve, reject) => {
      this.permissionManager.getUser(database, id, this.current.user.serverId).then(user => {
        user.permission = PermissionLevel.MOD
        this.permissionManager.save(user).then(res => {
          tzuyu.message('Promoted user to moderator', {messageDelay: -1})
          resolve()
        })
      })
    })
  }
  restrict (tzuyu, database, trigger, level) {
    let newLevel = parseInt(level)
    if (isNaN(newLevel) || newLevel < 1 || newLevel > 2) {
      // tzuyu.message('Provided level was not an integer or out of range')
      throw new TypeError('Provided level was not an integer or out of range')
    }
    return new Promise((resolve, reject) => {
      this.permissionManager.getCommand(database, trigger, this.current.user.serverId).then(command => {
        command.permission = level
        this.permissionManager.save(command).then(res => {
          tzuyu.message('Restricted command level', {messageDelay: -1})
          resolve()
        })
      })
    })
  }
}

module.exports = Permissions
