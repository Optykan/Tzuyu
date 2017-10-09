Error.stackTraceLimit = Infinity
var expect = require('expect')

function pass (m) {
  console.log('\x1b[32m[PASS]\x1b[0m ' + m)
}

function log (m) {
  console.log('\x1b[36m[LOG]\x1b[0m ' + m)
}

function error (m) {
  console.log('\x1b[31m[ERR]\x1b[0m ' + m)
  throw new Error(m)
}
// is this how you do tests?

var timeout = 15000 // how to long to wait for async tests to complete
var isTesting = []

log('beginning tests')

require('dotenv').config()

const Bot = require('./core/Bot')
const YouTube = require('./core/YouTube')
const MediaResolvable = require('./core/media/MediaResolvable')
const MediaResolver = require('./core/media/MediaResolver')
const Playlist = require('./core/media/Playlist')
const Song = require('./core/media/Song')
const Delegator = require('./core/CommandDelegator')
const { Client } = require('pg')
var Postgres = new Client()
Postgres.connect()

var Tzuyu = new Bot()

let injectables = {
  'Tzuyu': Tzuyu,
  'YouTube': YouTube,
  'MediaResolver': MediaResolver,
  'Database': Postgres
}

var CommandDelegator = new Delegator(injectables)
require('./plugins/init')(CommandDelegator)

log('Testing command delegation')
isTesting.push(true)

CommandDelegator.registerPluginHook('test', (yt, tzuyu) => {
  isTesting.pop()
  expect(tzuyu.constructor.name).toEqual('Bot')
  expect(yt.name).toEqual('YouTube')
  pass('Command delegation passed')
}, 'Tzuyu@tzuyu,YouTube@yt')

let testMessage = {
  content: CommandDelegator.prefix + 'test here are some params',
  channel: {
    id: process.env.BOT_CHANNEL
  },
  author: {
    id: '000000000000000000'
  },
  member: {
    guild: {
      id: '000000000000000000'
    }
  }
}
CommandDelegator.addInjectable('Message', testMessage)
CommandDelegator.parseIncomingMessage(Tzuyu, testMessage)

Tzuyu.login(process.env.BOT_TOKEN)

log('Resolving Mada Mada song...')
var playRequest = YouTube.parsePlayRequest('https://www.youtube.com/watch?v=smecoorx1rA')
expect(playRequest instanceof MediaResolvable)
expect(playRequest).toEqual(new MediaResolvable('youtube#video', 'smecoorx1rA'))

isTesting.push(true)
MediaResolver.resolve(playRequest).then(song => {
  expect(song instanceof Song)
  expect(song).toEqual(new Song('smecoorx1rA', 'Mada Mada song'))
  pass('Successfully resolved Mada Mada song')
  isTesting.pop()
}).catch(error)

isTesting.push(true)
log('Resolving kpop garbage...')
playRequest = YouTube.parsePlayRequest('https://www.youtube.com/playlist?list=PLQI-1xShgqUKXYHOwjicC-zVOcKb_t9gs')
expect(playRequest).toEqual(new MediaResolvable('youtube#playlist', 'PLQI-1xShgqUKXYHOwjicC-zVOcKb_t9gs'))
MediaResolver.resolve(playRequest).then(playlist => {
  expect(playlist instanceof Playlist)
  pass('Successfully resolved kpop garbage...')
  isTesting.pop()
}).catch(error)

isTesting.push(true)
log('Resolving genji circulation...')
YouTube.search('ypM7qHf7zQw').then(media => {
  expect(media).toEqual(new MediaResolvable('youtube#video', 'ypM7qHf7zQw', 'Genji Circulation'))
  pass('Successfully resolved genji circulation')
  isTesting.pop()
  // i love testing
}).catch(error)

// end tests...
const retry = 500
function waitForAsyncTests (times) {
  if (isTesting.length !== 0) {
    // log('waiting on ' + isTesting.length + ' tests...')
    if (times > timeout / retry) {
      error('Async requests timed out...')
      process.exit(1)
    }
    setTimeout(() => {
      if (!times) { times = 0 }

      waitForAsyncTests(times + 1)
    }, retry)
  } else {
    pass('All tests passed')
    process.exit(0)
  }
}

waitForAsyncTests()
