require('dotenv').config()

const Bot = require('./core/Bot')
const YouTube = require('./core/YouTube')
const MediaResolver = require('./core/media/MediaResolver')
// const Delegator = require('./core/CommandDelegator')

var Tzuyu = new Bot()

// we can add things here because things pass by reference here in JS land
// let injectables = {
//   'Tzuyu': Tzuyu,
//   'YouTube': YouTube,
//   'MediaResolver': MediaResolver
// }
// var CommandDelegator = new Delegator(injectables)

// var YouTube = new YouTubeInterface(process.env.YT_API_KEY);

Tzuyu.client.on('ready', () => {
  console.log('Loaded!')
  Tzuyu.setTextChannel(process.env.BOT_CHANNEL)
  Tzuyu.setVoiceChannel(process.env.BOT_VOICE_CHANNEL)
  Tzuyu.setPlaying('Overwatch') // hehe
})

// handle message events (really the only thing we need to do)
Tzuyu.client.on('message', message => {
  var input = message.content.split(/\s(.+)/)
  var command = input[0].toLowerCase()
  const params = input[1]

  if (message.channel.type === 'dm') {
    // do something for dm's
    // Tzuyu.text.channel = Tzuyu.client.channels.get(message.channel.id);
    // //go away...
    // Tzuyu.message("zzz...");
    return false
  }

  if (!message.member || !message.member.voiceChannelID) {
    // if the user is not in a voice channel
    return false
  }

  if (!command.startsWith(Tzuyu.getPrefix())) {
    return false
  }

  if (!Tzuyu.isPermitted(message.author.id)) {
    return false
  }

  Tzuyu.setTextChannel(message.channel.id)
  // console.log(message);

  command = command.substring(1)
  // play command
  switch (command) {
    case 'play':
      Tzuyu.setVoiceChannel(message.member.voiceChannelID)
      var request = YouTube.parsePlayRequest(params)
      MediaResolver.resolve(request).then(media => {
        Tzuyu.play(media)
      }).catch(console.error)
      break

    case 'playing':
    // Remind me to collect the ID of user who added the playlist as well (later tho)
      // Tzuyu.currentSong();
      // does this overlap with listQ?
      break

    case 'kill':
      Tzuyu.leave()
      break

    case 'leave':
      Tzuyu.leave()
      break

    case 'skip':
      Tzuyu.message('Skipped song')
      Tzuyu.skip()
      break

    case 'queue':
      Tzuyu.listQueue()
      break

    case 'shuffle':
      Tzuyu.shuffle()
      Tzuyu.message('Shuffled queue')
      break

    case 'config_prefix':
      Tzuyu.setPrefix(params)
      Tzuyu.message('Changed prefix to `' + params + '`')
      break

    case 'help':
      Tzuyu.message('Available commands: \n\n play, kill, leave, skip, queue, bump, remove, config_prefix, config_delete_delay \n\n Current prefix: `' + Tzuyu.getPrefix() + '`')
      break

    case 'bump':
      Tzuyu.bump(params)
      break

    case 'remove':
      Tzuyu.removeFromQueue(params)
      break

    case 'config_delete_delay':
      if (Tzuyu.setMessageDeleteDelay(params)) {
        Tzuyu.message('Changed delay to `' + params + '`ms')
      } else {
        Tzuyu.message('Sorry! Something went wrong')
      }
      break
  }
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
  Tzuyu.message('Received suicide order, leaving...', () => {
    Tzuyu.leave()
    process.exit()
  })
})

Tzuyu.login(process.env.BOT_TOKEN)
