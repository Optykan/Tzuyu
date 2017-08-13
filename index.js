require('dotenv').config()

const Net = require('./core/Net')
const Bot = require('./core/Bot')
const YouTube = require('./core/YouTube')
const MediaResolver = require('./core/media/MediaResolver')
const Delegator = require('./core/CommandDelegator')
const { Client } = require('pg')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var Postgres = new Client()
var Tzuyu = new Bot()

rl.prompt()

// open a CLI to postgres
rl.on('line', (line) => {
  var start = new Date().getTime()
  line = line.trim()
  Postgres.query(line).then(res => {
    var time = new Date().getTime() - start
    if (res.rowCount === 0) {
      console.log('\x1b[36m[POSTGRES]\x1b[0m ('+time+'ms) Query returned 0 items ')
    } else if (res.command !== 'SELECT') {
      console.log('\x1b[36m[POSTGRES]\x1b[0m ('+time+'ms) ' + res.command + ' command completed successfully, updated ' + res.rowCount + ' row(s)')
    } else {
      console.log('\x1b[36m[POSTGRES]\x1b[0m ('+time+'ms) Query result:')
      console.log(res.rows)
    }
    rl.prompt()
  })
}).on('close', () => {
  console.log('Exiting...')
  process.exit(0)
})


console.log('Establishing database connection...')
Postgres.connect()

// we can add things here because things pass by reference here in JS land
let injectables = {
  'Tzuyu': Tzuyu,
  'YouTube': YouTube,
  'MediaResolver': MediaResolver,
  'Net': Net
}

var CommandDelegator = new Delegator(injectables)
require('./plugins/init')(CommandDelegator)
// yes, we're adding itself as an injectable
CommandDelegator.addInjectable('CommandDelegator', CommandDelegator)
CommandDelegator.addInjectable('Database', Postgres)

console.log('\x1b[32m[POSTGRES]\x1b[0m Opened POSTGRES connection: ')
// ============== [READY] ================

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
