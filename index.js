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
  CommandDelegator.addInjectable('Message', message)

  if (message.channel.type === 'dm') {
    // Tzuyu.message("zzz...");
    return false
  }

  if (!Tzuyu.isPermitted(message.author.id)) {
    return false
  }

  Tzuyu.setTextChannel(message.channel.id)
  CommandDelegator.parseIncomingMessage(message)
})

Tzuyu.login(process.env.BOT_TOKEN)
