'use strict';

class Queue{
	constructor(){
		this.q = [];
	}
	enqueue(song){
		this.q.push(song);
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
	shuffle(){
		//blatantly ripped from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
	    for (let i = this.q.length; i; i--) {
	        let j = Math.floor(Math.random() * i);
	        [this.q[i - 1], this.q[j]] = [this.q[j], this.q[i - 1]];
	    }
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
	removeFromQueue(index){
		if(index>0 && index<this.q.length+1){
			return this.q.splice(index-1,1);
		}
		return false;
	}
	bump(index){
		let t=this.removeFromQueue(index);
		if(t){
			this.q.unshift(t[0]);
			return t;
		}
		return false;
	}
}

module.exports = Queue;
