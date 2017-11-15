'use strict'

// this module should handle all the events emitted by the bot and invoke the
// appropriate delegators
// really I should be using the eventEmitter but I'll figure that out later...

const injectables = []
var eventList = []
const events = require('events')
const eventEmitter = new events.eventEmitter()

class Event{
	constructor(event, context=this){
		this.event=event
		this.context=context
	}
	invoke(){
		callback.apply(this.context, injectables)
	}
}

class Events{
	provideInjectables(inj){
		injectables = inj
	}
	on(event, callback){
		eventList.push(new Event(event, callback))
	}
	emit(event){
		for(let e in eventList){
			if(e.event === event){
				e.event.invoke()
			}
		}
	}
}

module.exports = Events