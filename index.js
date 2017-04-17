require('dotenv').config();

const Discord = require('discord.js');

const ytdl = require('ytdl-core');

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
}

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
}

Bot.client.on('ready', () => {
	console.log('I am ready!');
	Bot.text.channel = Bot.client.channels.get(process.env.BOT_CHANNEL);
	Bot.voice.channel = Bot.client.channels.get(process.env.BOT_VOICE_CHANNEL);
});

Bot.client.on('message', message => {
	//play command
	if (message.content.startsWith(Bot.prefix+"play")) {
		Bot.voice.channel.join()
		.then(connection => {
			Bot.connection = connection;
			const stream = ytdl(message.content.split(" ")[1], {filter : 'audioonly'});
			const dispatcher = connection.playStream(stream, Bot.streamOptions);
		})
		.catch(console.error);
	}

	//kill command
	else if(message.content.startsWith(Bot.prefix+"kill")){
		Bot.voice.channel.leave();
	}
});

Bot.client.login(process.env.BOT_TOKEN);