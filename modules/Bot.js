'use strict';

const ytdl = require('ytdl-core');
const Queue = require('./Queue');
const Discord = require("discord.js");

class Bot {
	constructor(){
		this.streamOptions = { 
			seek: 0, 
			volume: 0.05 
		};
		this.voice ={
			channel : null
		};
		this.text = {
			channel: null
		};
		this.connection= null;
		this.queue = new Queue();
		this.dispatcher = null;
		this.client = new Discord.Client();
		this.config = {
			prefix: "%",
			messageDelay: 15000
		}
		this.isConnecting = false;

		this.permlist={
			users: [116399321661833218, 304780284077801472],
			isActive: true,
			type: 'blacklist'
		};
	}

	addToPermlist(id){
		this.whitelist.push(id);
	}

	isPermitted(id){
		if(this.permlist.isActive){
			if(this.permlist.type=="whitelist"){
				return this.permlist.users.includes(id);
			}else{
				return !this.permlist.users.includes(id);
			}
		}else{
			return true;
		}
	}
	setPermlistStatus(status){
		this.permlist.type = status;
	}
	
	join(id){
		if(!this.voice.connection){
			this.isConnecting = true;
			if(!id){
				return this.voice.channel.join();
			}else{
				this.voice.channel = this.client.channels.get(id);
				return this.voice.channel.join();
			}
		}
	}
	
	leave(){
		this.queue.dumpQ();
		if(this.dispatcher){
			this.dispatcher.end();
		}
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
		this.text.channel.send(m).then(message=>{
			message.delete(this.config.messageDelay);
		}).catch(console.error);
	}
	_ensureConnectionAfterRequest(isPlaylist){
		if(!this.connection && !this.isConnecting){
			console.log("No connection, connecting...");

			this.join().then(conn=>{
				this.isConnecting = false;
				this.connection = conn;
				this._playAfterLoad();
			}).catch(e => {
				console.error(e);
				this.leave();
			});
		}else if(!isPlaylist){
			var latest=this.queue.peekLast();
			if(latest && !isPlaylist){
				let title=latest.title;
				let url = latest.url;
				this.message("Added **"+title+"** to the queue");
			}else{
				this.message("Something happened");
			}
		}
	}
	playList(listArray){
		this.message("Adding playlist to queue");
		if(listArray){
			for(let i=0; i<listArray.length; i++){
				this.playGivenTitle(listArray[i].url, listArray[i].title, true);
			}
		}else{
			this.message("Something went wrong");
		}
	}
	playGivenTitle(yturl, title, isPlaylist){
		this.queue.enqueue(yturl, title);
		this._ensureConnectionAfterRequest(isPlaylist);
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

		this._ensureConnectionAfterRequest();
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

		for(var j=0; j<Math.ceil((q.length)/25); j++){
			for(let i=j*25; i<(j*25)+25; i++){
				if(!q[i])
					break;

				output += (i+1).toString()+". **"+q[i].title+"**\n";
			}	
			this.message(output);
			output="";
		}
	}
	bump(songIndex){
		if(!isNan(parseInt(songIndex))){
			let res = this.queue.bump(parseInt(songIndex));
			if(typeof res == "object" && res[0]){
				this.message("Bumped "+res[0].title+" to front of queue");
			}else{
				this.message("No song found at index `"+songIndex+"`");
			}
		}
	}
	removeFromQueue(songIndex){
		if(!isNan(parseInt(songIndex))){
			let t = this.queue.removeFromQueue(parseInt(songIndex));
			if(typeof t =="object" &&t[0]){
				this.message("Removed "+t[0].title+" from queue");
			}else{
				this.message("No song found at index "+songIndex);
			}
		}
	}
	shuffle(){
		this.queue.shuffle();
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
	setPrefix(pfx){
		this.config.prefix = pfx;
	}
	getPrefix(){
		return this.config.prefix;
	}
	setMessageDeleteDelay(i){
		if(!isNan(parseInt(i))){
			this.config.messageDelay = parseInt(i);
			return true;
		}
		return false;
	}
	login(token){
		this.client.login(token);
	}
}

module.exports = Bot;