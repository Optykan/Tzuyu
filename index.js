require('dotenv').config();

const Discord = require('discord.js');

const ytdl = require('ytdl-core');

var Queue={
	q: [],
	enqueue: function(i){
		this.q.push(i);
	},
	dequeue: function(){
		if(this.isEmpty()){
			return false;
		}
		return this.q.shift();
	},
	isEmpty: function(){
		return this.q.length == 0;
	},
	returnQ: function(){
		return this.q;
	}
};

var Bot={
	client: new Discord.Client(),
	streamOptions: { 
		seek: 0, 
		volume: 1 
	},
	voice:{
		channel : null
	},
	text : {
		channel: null
	},
	prefix: "%",
	connection: null,
	queue: Queue,
	dispatcher: null,
	join: function(id){
		if(!Bot.voice.connection){
			if(!id){
				return Bot.voice.channel.join();
			}else{
				Bot.voice.channel = Bot.client.channels.get(id);
				return Bot.voice.channel.join();
			}
		}
	},
	leave: function(){
		if(Bot.connection){
			this.voice.channel.leave();
			this.connection=null;
		}else{
			//check to see if it died
			const conns = Bot.client.voiceConnections.array();
			console.log(conns);
			if(conns.length>0){
				for (var i = conns.length - 1; i >= 0; i--) {
					conns[i].leave();
				};
			}
		}
	},
	_playAfterLoad: function(yturl){
		var stream = null;
		if(!yturl){
			//no url provided, just play from queue
			if(Bot.queue.isEmpty()){
				return Bot.message("Queue is empty");
			}
			const url = Bot.queue.dequeue();
			stream = ytdl(url, {filter : 'audioonly'});
			console.log("playing" +url);
		}else{
			console.log("provided param "+yturl);
			stream = ytdl(yturl, {filter : 'audioonly'});
		}
		try{
			Bot.dispatcher = Bot.connection.playStream(stream, Bot.streamOptions);
			Bot.dispatcher.on('end', function(){
				dispatcher = null;																												
				if(Bot.queue.isEmpty()){
					Bot.message("Queue is empty, leaving...")
					Bot.leave();
				}else{
					Bot._playAfterLoad(Bot.queue.dequeue());
				}
			});
		}catch(e){
			console.log(e);
			Bot.message("Something happened");
		}
	},
	message: function(m){
		Bot.text.channel.send(m);
	},
	play: function(yturl){
		Bot.queue.enqueue(yturl);
		if(!Bot.connection){
			console.log("No connection, connecting...");
			Bot.join().then(conn=>{
				Bot.connection = conn;
				Bot._playAfterLoad();
			}).catch(console.error);
		}else{
			// Bot._playAfterLoad();
			//do nothing...
		}
	},
	stop: function(){
		if(Bot.dispatcher){
			Bot.dispatcher.end();
		}
		Bot.leave();
	},
	skip: function(){
		if(Bot.dispatcher){
			Bot.dispatcher.end();
		}
	},
	listQ: function(){
		Bot.message(Bot.queue.returnQ());
	}

};


Bot.client.on('ready', () => {
	console.log('Loaded!');
	Bot.text.channel = Bot.client.channels.get(process.env.BOT_CHANNEL);
	Bot.voice.channel = Bot.client.channels.get(process.env.BOT_VOICE_CHANNEL);
});

Bot.client.on('message', message => {
	var input = message.content.split(/\s(.+)/);
	var command = input[0].toLowerCase();
	const params = input[1];

	Bot.text.channel = Bot.client.channels.get(message.channel.id);

	// console.log(message.member.voiceChannelID);
	if(!message.member.voiceChannelID){
		return false;
	}

	// console.log(command);
	// console.log(message);

	if(!command.startsWith(Bot.prefix)){
		// console.log("not a command");
		return false;
	}

	command=command.substring(1);
	//play command
	switch(command){

		case "play":
		Bot.voice.channel = Bot.client.channels.get(message.member.voiceChannelID);
		Bot.play(params);
		break;

		case "kill":
		Bot.leave();
		break;

		case "leave":
		Bot.leave();
		break;

		case "skip":
		Bot.skip();
		break;

		case 'queue':
		Bot.listQ();
		break;

		case "config_prefix":
		Bot.prefix=params;
		Bot.message("Changed prefix to "+params);
		break;

	}
});

//handle some dirty windows things
if (process.platform === "win32") {
	var rl = require("readline").createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on("SIGINT", function () {
		process.emit("SIGINT");
	});
}

process.on("SIGINT", function () {
  //graceful shutdown
  Bot.leave();
  process.exit();
});

Bot.client.login(process.env.BOT_TOKEN);