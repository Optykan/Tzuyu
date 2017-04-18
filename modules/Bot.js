'use strict';

const ytdl = require('ytdl-core');
const Queue = require('./Queue');

class Bot {
	constructor(client){
		this.streamOptions = { 
			seek: 0, 
			volume: 1 
		};
		this.voice ={
			channel : null
		},
		this.text = {
			channel: null
		},
		this.prefix = "%";
		this.connection= null;
		this.queue = new Queue();
		this.dispatcher = null;
		this.client = client;
	}
	
	join(id){
		if(!this.voice.connection){
			if(!id){
				return this.voice.channel.join();
			}else{
				this.voice.channel = this.client.channels.get(id);
				return this.voice.channel.join();
			}
		}
	}
	
	leave(){
		if(this.connection){
			this.voice.channel.leave();
			this.connection=null;
		}else{
			//check to see if it died
			const conns = this.client.voiceConnections.array();
			console.log(conns);
			if(conns.length>0){
				for (var i = conns.length - 1; i >= 0; i--) {
					conns[i].leave();
				};
			}
		}
	}
	_playAfterLoad(yturl){
		var stream = null;
		if(!yturl){
			//no url provided, just play from queue
			if(this.queue.isEmpty()){
				return this.message("Queue is empty");
			}
			const url = this.queue.dequeue();
			stream = ytdl(url, {filter : 'audioonly', quality: "lowest"});
			console.log("playing" +url);
		}else{
			console.log("provided param "+yturl);
			stream = ytdl(yturl, {filter : 'audioonly'});
		}
		try{
			this.dispatcher = this.connection.playStream(stream, this.streamOptions);
			this.dispatcher.on('end', function(){
				this.dispatcher = null;																												
				if(this.queue.isEmpty()){
					this.message("Queue is empty, leaving...")
					this.leave();
				}else{
					this._playAfterLoad(this.queue.dequeue());
				}
			}.bind(this));
		}catch(e){
			console.log(e);
			this.message("Something happened");
		}
	}
	message(m){
		this.text.channel.send(m);
	}
	play(yturl){
		this.queue.enqueue(yturl);
		if(!this.connection){
			console.log("No connection, connecting...");
			this.join().then(conn=>{
				this.connection = conn;
				this._playAfterLoad();
			}).catch(e => {
				console.error(e);
				this.leave();
			});
		}else{
			// this._playAfterLoad();
			//do nothing...
		}
	}

	stop(){
		if(this.dispatcher){
			this.dispatcher.end();
		}
		this.leave();
	}
	skip(){
		if(this.dispatcher){
			this.dispatcher.end();
		}
	}
	listQ(){
		this.message(this.queue.returnQ());
	}
	setPlaying(status){
		this.client.user.setGame(status);
	}
	setStatus(status){
		this.client.user.setStatus(status);
	}
}

module.exports = Bot;