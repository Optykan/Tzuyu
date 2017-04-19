require('dotenv').config();

const Bot = require('./modules/Bot');
const Discord = require('discord.js');

var Tzuyu = new Bot();

Tzuyu.client.on('ready', () => {
	console.log('Loaded!');
	Tzuyu.setTextChannel(process.env.BOT_CHANNEL);
	Tzuyu.setVoiceChannel(process.env.BOT_VOICE_CHANNEL);
	Tzuyu.setPlaying("Overwatch"); //hehe
});

//handle message events (really the only thing we need to do)
Tzuyu.client.on('message', message => {
	var input = message.content.split(/\s(.+)/);
	var command = input[0].toLowerCase();
	const params = input[1];

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

	Tzuyu.setTextChannel(message.channel.id);

	if(!command.startsWith(Tzuyu.config.prefix)){
		// console.log("not a command");
		return false;
	}

	// console.log(message);

	command=command.substring(1);
	//play command
	switch(command){

		case "play":
		Tzuyu.setVoiceChannel(message.member.voiceChannelID);
		Tzuyu.play(params, message);
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
		Tzuyu.setPrefix(params);
		Tzuyu.message("Changed prefix to `"+params+"`");
		break;

		case "config_delete_delay":
		if(Tzuyu.setPrefix(params)){
			Tzuyu.message("Changed delay to `"+params+"`ms");
		}else{
			Tzuyu.message("Sorry! Something went wrong");
		}
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

Tzuyu.login(process.env.BOT_TOKEN);