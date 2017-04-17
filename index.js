require('dotenv').config();

const Discord = require('discord.js');

const ytdl = require('ytdl-core');

var Queue={
	queue: [],
	enqueue: function(i){
		this.queue.push(i);
	},
	dequeue: function(){
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
	join: function(id){
		if(typeof id == "undefined"){
			return Bot.voice.channel.join();
		}else{
			Bot.voice.channel = Bot.client.channels.get(id);
			return Bot.voice.channel.join();
		}
	},
	leave: function(){
		this.voice.channel.leave();
		this.connection=null;
	},
	_playAfterLoad: function(yturl){
		const stream = ytdl(yturl, {filter : 'audioonly'});
		console.log(Bot.connection);
		try{
			const dispatcher = Bot.connection.playStream(stream, Bot.streamOptions);
			dispatcher.end(function(){
				if(Bot.queue.isEmpty){
					Bot.leave();
				}else{
					Bot.play(Bot.queue.dequeue());
				}
			});
		}catch(e){
			console.log(e);
		}
	},
	message: function(m){
		Bot.text.channel.send(m);
	},
	play: function(yturl){
		if(!Bot.connection){
			console.log("No connection, connecting...");
			Bot.join().then(conn=>{
				Bot.connection = conn;
				Bot._playAfterLoad(yturl);
			});
		}else{
			Bot._playAfterLoad(yturl);
		}
	}
};


Bot.client.on('ready', () => {
	console.log('I am ready!');
	Bot.text.channel = Bot.client.channels.get(process.env.BOT_CHANNEL);
	Bot.voice.channel = Bot.client.channels.get(process.env.BOT_VOICE_CHANNEL);
});

Bot.client.on('message', message => {
	var input = message.content.split(/\s(.+)/);
	var command = input[0].toLowerCase();
	const params = input[1];

	console.log(command);
	// console.log(message);

	if(!command.startsWith(Bot.prefix)){
		console.log("not a command");
		return false;
	}

	command=command.substring(1);
	//play command
	switch(command){
		case "join":
		Bot.join(message.member.voiceChannelID).then(conn=>{
			Bot.connection = conn;
		});
		break;

		case "play":
		Bot.play(params);
		break;

		case "kill":
		Bot.leave();
		break;

		case "leave":
		Bot.leave();
		break;

		case "config_prefix":
		Bot.prefix=params;
		Bot.message("Changed prefix to "+params);
		break;

	}
});

Bot.client.login(process.env.BOT_TOKEN);