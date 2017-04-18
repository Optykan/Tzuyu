require('dotenv').config();

const Bot = require('./modules/Bot');
const Discord = require('discord.js');

var Tzuyu = new Bot(new Discord.Client());

Tzuyu.client.on('ready', () => {
	console.log('Loaded!');
	Tzuyu.text.channel = Tzuyu.client.channels.get(process.env.BOT_CHANNEL);
	Tzuyu.voice.channel = Tzuyu.client.channels.get(process.env.BOT_VOICE_CHANNEL);
	Tzuyu.setPlaying("Overwatch"); //hehe
});

Tzuyu.client.on('message', message => {
	var input = message.content.split(/\s(.+)/);
	var command = input[0].toLowerCase();
	const params = input[1];


	// console.log(message.member.voiceChannelID);
	//if the message member is null or the voice channel id doesnt exist (hello)

	// console.log(message);
	if(message.channel.type == 'dm'){
		//do something for dm's
		// Tzuyu.text.channel = Tzuyu.client.channels.get(message.channel.id);
		// //go away... 
		// Tzuyu.message("zzz...");
		return false;
	}
	if(!message.member || !message.member.voiceChannelID){
		return false;
	}

	Tzuyu.text.channel = Tzuyu.client.channels.get(message.channel.id);
	// console.log(command);
	// console.log(message);

	if(!command.startsWith(Tzuyu.prefix)){
		// console.log("not a command");
		return false;
	}

	command=command.substring(1);
	//play command
	switch(command){

		case "play":
		Tzuyu.voice.channel = Tzuyu.client.channels.get(message.member.voiceChannelID);
		Tzuyu.play(params);
		break;

		case "kill":
		Tzuyu.leave();
		break;

		case "leave":
		Tzuyu.leave();
		break;

		case "skip":
		Tzuyu.skip();
		break;

		case 'queue':
		Tzuyu.listQ();
		break;

		case "config_prefix":
		Tzuyu.prefix=params;
		Tzuyu.message("Changed prefix to "+params);
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
  Tzuyu.leave();
  process.exit();
});

Tzuyu.client.login(process.env.BOT_TOKEN);