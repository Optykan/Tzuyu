'use strict';

class Queue{
	constructor(){
		this.q = [];
	}
	enqueue(i){
		this.q.push(i);
	}
	dequeue(){
		if(this.isEmpty()){
			return false;
		}
		return this.q.shift();
	}
	isEmpty(){
		return this.q.length == 0;
	}
	returnQ(){
		return this.q;
	}
}

module.exports = Queue;
