const Command = require('./Command')
class CommandDelegator {
  constructor () {
    this.prefix = '$'
    this.commands = []
  }

  registerPluginHook (trigger, action) {
    if (!this.isTriggerRegistered(trigger)) {
      this.commands.push(new Command(trigger, action))
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
        this.commands[c].execute(params)
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
