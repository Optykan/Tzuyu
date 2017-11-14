'use strict'

// this module should handle all the events emitted by the bot and invoke the
// appropriate delegators

var eventList = []
const events = require('events')

class Event{
	constructor(event, injectables, context=this){
		this.eventEmitter = new events.eventEmitter()
		this.event=event
		this.injectables=injectables
		this.context=context
	}
	invoke(args){
		callback.apply(this.context, args)
	}
}

class Events{
	on(event, injectables, callback){
		eventList.push(new Event(event, injectables, callback))
	}	
}

module.exports = Events