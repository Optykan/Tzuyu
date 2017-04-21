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
	peek(){
		return this.q[0];
	}
	peekLast(){
		if(this.q.length==0){
			return false;
		}
		return this.q[this.q.length-1];
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
