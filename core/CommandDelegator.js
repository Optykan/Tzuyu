const Command = require('./Command')
class CommandDelegator {
  constructor (injectables) {
    this.prefix = '$'
    this.commands = []
    this.injectables = injectables
  }

  _registerTrigger (trigger, action, injects) {
    if (trigger.length < 1) {
      throw new TypeError('Plugin trigger cannot be empty')
    } else if (typeof trigger === 'string' && trigger.search(' ') !== -1) {
      throw new TypeError('Plugin trigger cannot contain spaces')
    } else if (!this.isTriggerRegistered(trigger)) {
      this.commands.push(new Command(trigger, action, injects))
    } else {
      console.log(this.commands)
      throw new Error('Trigger ' + trigger + ' already registered')
    }
  }

  registerPluginHook (trigger, action, injects) {
    // where injects is of format thingToInject@paramName
    if (typeof trigger === 'object' && typeof action === 'object' && typeof injects === 'object' && trigger.length === action.length && action.length === injects.length) {
      for (let i = 0; i < trigger.length; i++) {
        this._registerTrigger(trigger[i], action[i], injects[i])
      }
    } else {
      this._registerTrigger(trigger, action, injects)
    }
  }

  parseIncomingMessage (message) {
    let request = this.resolveParamsFromMessage(message.content)
    if (request !== false) {
      this.delegateCommand(request.command, request.params)
    } else {
      // do nothing because its not a command
    }
  }

  delegateCommand (command, params) {
    for (let c in this.commands) {
      if (this.commands[c].trigger.toLowerCase() === command.toLowerCase()) {
        this.commands[c].execute(this.injectables, params)
      }
    }
  }

  resolveParamsFromMessage (message) {
    // should return {command: command, params: []}
    if (!message.startsWith(this.prefix)) { return false }

    let input = message.split(' ')
    let command = input[0].substring(1)
    input.shift()

    return {
      command: command,
      params: [...input]
    }
  }

  isTriggerRegistered (trigger) {
    for (let c in this.commands) {
      if (this.commands[c].trigger.toLowerCase() === trigger.toLowerCase()) {
        return true
      }
    }
    return false
  }
}

module.exports = CommandDelegator
