require('dotenv').config()

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
	} 
	text : {
		channel: null
	}

}

Bot.client.on('ready', () => {
  console.log('I am ready!');
  Bot.text.channel = Bot.client.channels.get(process.env.BOT_CHANNEL);
  Bot.voice.channel = Bot.client.channels.get(process.env.BOT_VOICE_CHANNEL);
});

Bot.client.on('message', message => {
  if (message.content.startsWith("%play")) {
    Bot.voice.channel.join()
	 .then(connection => {
	 	console.log(message);
	   const stream = ytdl(message.content.split(" ")[1], {filter : 'audioonly'});
	   const dispatcher = connection.playStream(stream, Bot.streamOptions);
	 })
	 .catch(console.error);
  }
});

Bot.client.login(process.env.BOT_TOKEN);