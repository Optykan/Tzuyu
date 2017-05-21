require('dotenv').config()

const Bot = require('./core/Bot')
const YouTube = require('./core/YouTube')
const MediaResolver = require('./core/media/MediaResolver')
const Delegator = require('./core/CommandDelegator')

var Tzuyu = new Bot()

// we can add things here because things pass by reference here in JS land
let injectables = {
  'Tzuyu': Tzuyu,
  'YouTube': YouTube,
  'MediaResolver': MediaResolver
}

var CommandDelegator = new Delegator(injectables)
require('./plugins/init')(CommandDelegator)
// yes, we're adding itself as a delegator
CommandDelegator.addInjectable('CommandDelegator', CommandDelegator)

Tzuyu.client.on('ready', () => {
  console.log('Loaded!')
  Tzuyu.setTextChannel(process.env.BOT_CHANNEL)
  Tzuyu.setVoiceChannel(process.env.BOT_VOICE_CHANNEL)
  Tzuyu.setPlaying('Overwatch') // hehe
})

// handle message events (really the only thing we need to do)
Tzuyu.client.on('message', message => {
  if (message.channel.type === 'dm') {
    // do something for dm's
    // Tzuyu.text.channel = Tzuyu.client.channels.get(message.channel.id);
    // //go away...
    // Tzuyu.message("zzz...");
    return false
  }

  // if (!message.member || !message.member.voiceChannelID) {
  //   // if the user is not in a voice channel
  //   return false
  // }

  if (!Tzuyu.isPermitted(message.author.id)) {
    return false
  }

  Tzuyu.setTextChannel(message.channel.id)
  Tzuyu.setVoiceChannel(message.member.voiceChannelID)
  CommandDelegator.parseIncomingMessage(message)
})

// handle some dirty windows things
if (process.platform === 'win32') {
  var rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', function () {
    process.emit('SIGINT')
  })
}

process.on('SIGINT', function () {
  // graceful shutdown
  // console.log('siginted');
  // // Tzuyu.message("Ending life, sponsored by Microsoft© Windows™", ()=>{
   //  Tzuyu.leave();
  // });
  process.exit()
})

process.on('SIGTERM', function () {
  // console.log('sigtermed');
  Tzuyu.message('Received suicide order, leaving...', {messageDelay: -1}, () => {
    Tzuyu.leave()
    process.exit()
  })
})

Tzuyu.login(process.env.BOT_TOKEN)
