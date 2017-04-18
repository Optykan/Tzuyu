require('dotenv').config();

const Discord = require('discord.js');

const ytdl = require('ytdl-core');

var Queue={
	queue: [],
	enqueue: function(i){
		this.queue.push(i);
	},
	dequeue: function(){
		if(this.isEmpty()){
			return false;
		}
		return this.queue.shift();
	},
	isEmpty: function(){
		return this.queue.length == 0;
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
			console.log("provided param "+url);
			stream = ytdl(yturl, {filter : 'audioonly'});
		}
		try{
			Bot.dispatcher = Bot.connection.playStream(stream, Bot.streamOptions);
			Bot.dispatcher.on('end', function(){
				dispatcher = null;																												
				if(Bot.queue.isEmpty){
					Bot.leave();
				}else{
					Bot.play(Bot.queue.dequeue());
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
			Bot._playAfterLoad();
		}
	},
	stop: function(){
		if(Bot.dispatcher){
			dispatcher.end();
		}
		Bot.leave();
	},
	skip: function(){
		if(Bot.dispatcher){
			dispatcher.end();
		}
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

	if(!message.author.voiceChannelID){
		return Bot.message("Must be in a voice channel to use commands");
	}

	console.log(command);
	// console.log(message);

	if(!command.startsWith(Bot.prefix)){
		console.log("not a command");
		return false;
	}

	command=command.substring(1);
	//play command
	switch(command){

		case "play":
		Bot.voice.channel = message.author.voiceChannelID;
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