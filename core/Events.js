'use strict'

// this module should handle all the events emitted by the bot and invoke the
// appropriate delegators

var eventList = []

class Event{
	constructor(event, callback, context=this){
		this.event=event
		this.callback=callback
		this.context=context
	}
	invoke(args){
		callback.apply(this.context, args)
	}
}

class Events{
	on(event, callback){
		//eventList.push(new )
	}	
}