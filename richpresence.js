require('dotenv').config()

const readline = require('readline')
const Discord = require('discord.js');
const client = new Discord.Client( { autoreconnect: true } );

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('Connecting...');

rl.prompt()
rl.on('close', () => {
  client.destroy().then(() => {
    process.exit(0)
  })
})


client.on('ready', () => {
    console.log('ready');
    client.user.setPresence({
      status: 'online',
      game: {
        type: 1,
        url: 'http://www.twitch.tv/.',
        name: 'name',
        // state: 'other',
        details: 'details',
        application_id: 204744592350904320,
        assets: {
          small_image: 367072262005719060,
          small_text: 'small text',
          large_image: 367072957752672256,
          large_text: 'largetext'
        }
      }
    });
});


client.login(process.env.BOT_TOKEN);