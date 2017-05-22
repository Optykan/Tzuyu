const Command = require('./Command')
class CommandDelegator {
  constructor (injectables) {
    this.prefix = '%'
    this.commands = []
    this.injectables = injectables
  }

  addInjectable (key, value) {
    this.injectables[key] = value
  }

  enableTrigger (trigger, state) {
    for (let i = 0; i < this.commands.length; i++) {
      if (this.commands[i].trigger.toLowerCase() === trigger.toLowerCase()) {
        this.commands[i].trigger.enabled = state
        return true
      }
    }
    return false
  }

  _registerTrigger (trigger, action, injects, help, enabled, context) {
    if (trigger.length < 1) {
      throw new TypeError('Plugin trigger cannot be empty')
    } else if (typeof trigger === 'string' && trigger.search(' ') !== -1) {
      throw new TypeError('Plugin trigger cannot contain spaces')
    } else if (!this.isTriggerRegistered(trigger) || trigger === '*') {
      this.commands.push(new Command(trigger, action, injects, help, enabled, context))
    } else {
      throw new Error('Trigger ' + trigger + ' already registered')
    }
  }

  registerPluginHook (trigger, action, injects, help, enabled, context) {
    // called by init.js in /plugins
    // where injects is of format thingToInject@paramName
    if (typeof trigger === 'object' && typeof action === 'object' && typeof injects === 'object' && trigger.length === action.length && action.length === injects.length) {
      for (let i = 0; i < trigger.length; i++) {
        if (typeof help === 'string') {
          this._registerTrigger(trigger[i], action[i], injects[i], help, enabled, context)
        } else if (typeof help === 'object' && help[0]) {
          this._registerTrigger(trigger[i], action[i], injects[i], help[i], enabled, context)
        } else if (typeof help === 'object' && help[trigger[i]]) {
          this._registerTrigger(trigger[i], action[i], injects[i], help[trigger[i]], enabled, context)
        } else {
          throw new Error('Something went wrong in your plugin definition. Check your register method and try again')
        }
      }
    } else {
      this._registerTrigger(trigger, action, injects, help, enabled, context)
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

  delegateCommand (trigger, params) {
    for (let c in this.commands) {
      if (this.commands[c].trigger.toLowerCase() === trigger.toLowerCase()) {
        this.commands[c].execute(this.injectables, params)
        if (trigger !== '*') {
          break
        }
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

  findCommand (trigger) {
    for (let i = 0; i < this.commands.length; i++) {
      if (this.commands[i].trigger.toLowerCase() === trigger.toLowerCase()) {
        return this.commands[i]
      }
    }
    return false
  }
}

module.exports = CommandDelegator
