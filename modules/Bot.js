'use strict';

const ytdl = require('ytdl-core');
const Queue = require('./Queue');
const Discord = require("discord.js");

class Bot {
	constructor(){
		this.streamOptions = { 
			seek: 0, 
			volume: 1 
		};
		this.voice ={
			channel : null
		};
		this.text = {
			channel: null
		};
		this.prefix = "%";
		this.connection= null;
		this.queue = new Queue();
		this.dispatcher = null;
		this.client = new Discord.Client();
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
		this.setPlaying("Overwatch"); //well...
	}
	_playAfterLoad(yturl){
		//assumes we are connected to voice and plays the top of the queue or whatever is specified
		var stream = null;
		if(!yturl){
			//no url provided, just play from queue
			if(this.queue.isEmpty()){
				this.message("Queue is empty, leaving...");
				return this.leave();
			}
			let next= this.queue.dequeue();
			let url = next.url;
			let title = next.title;

			this.message("Now playing: **"+title+"**");

			this.setPlaying(title);
			stream = ytdl(url, {filter : 'audioonly', quality: "lowest"});

			console.log("playing" +url);
		}else{
			console.log("provided param "+yturl);
			stream = ytdl(yturl, {filter : 'audioonly'});
		}
		try{
			this.dispatcher = this.connection.playStream(stream, this.streamOptions);

			//bind a callback to do something when the song ends
			this.dispatcher.on('end', function(){
				this.dispatcher = null;																												
				if(this.queue.isEmpty()){
					this.message("Queue is empty, leaving...")
					return this.leave();
				}else{
					this._playAfterLoad();
				}
			}.bind(this));
		}catch(e){
			console.log(e);
			this.message("Something happened");
			this.leave();
		}
	}
	message(m){
		this.text.channel.send(m);
		setTimeout(()=>{
			this.text.bulkDelete(1);
		});
	}
	play(yturl, message, tries){
		if(message.embeds[0] && message.embeds[0].title){
			this.queue.enqueue(yturl, message.embeds[0].title);
		}else if(!tries || tries < 3){
			//turns 
			var that=this;//resolve setTimeOut scope

			//wait 500ms to see if discord will resolve the embed, and return to prevent further code execution
			if(!tries){
				tries=0;
			}
			return setTimeout(function(){
				that.play(yturl, message, tries+1);
			}, 500);
		}else{
			//nothign we can doo
			this.queue.enqueue(yturl, "???");
		}

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
			if(message.embeds[0] && message.embeds[0].title){
				this.message("Added **"+message.embeds[0].title+"** to the queue");
			}else{
				this.message("Added unknown song to the queue");
			}
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
		var output = "";

		if(this.queue.isEmpty()){
			return this.message("Queue is empty");
		}
		var q = this.queue.returnQ();
		for(let i=0; i<q.length; i++){
			output += (i+1).toString()+q[i].title+"\n";
		}
		this.message(output);
	}
	setPlaying(status){
		this.client.user.setGame(status);
	}
	setStatus(status){
		this.client.user.setStatus(status);
	}
	setVoiceChannel(chanID){
		this.voice.channel = this.client.channels.get(chanID);
	}
	setTextChannel(chanID){
		this.text.channel = this.client.channels.get(chanID);	
	}
	login(token){
		this.client.login(token);
	}
}

module.exports = Bot;