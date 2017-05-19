class CommandDelegator {
  constructor(){
    this.prefix = "$"
    this.commands = []
  }

  resolveParamsFromMessage (message) {
    //should return {command: command, params: []}
    return {
      command: x,
      params: []
    }
  }

  delegateCommand(command, params){
    for(c in this.commands){
      if(this.commands[c].toLowerCase() === command.toLowerCase()){
        this.commands[i].execute(params);
      }
    }
  }


  registerPluginHooks (trigger, action) {
    this.commands.push(new Command(trigger, action))
  }
}

module.exports = CommandDelegator
