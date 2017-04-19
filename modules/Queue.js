'use strict';

class Queue{
	constructor(){
		this.q = [];
	}
	enqueue(url, title){
		this.q.push({'url': url, 'title': title});
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
	dumpQ(){
		this.q=[];
	}
}

module.exports = Queue;
