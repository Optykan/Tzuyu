class Command{
	constructor(trigger, callback){
		this.trigger = trigger
    this.callback = callback
	}
  execute(params){
    this.callback(...params)
  }

}

module.exports = Command