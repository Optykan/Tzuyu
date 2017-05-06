var expect = require('expect')
// is this how you do tests?

var timeout = 15000 // how to long to wait for async tests to complete
var isMakingAsyncRequest = false

console.log('beginning tests')

require('dotenv').config()

const Bot = require('./modules/Bot')
const YouTube = require('./modules/YouTube')
const MediaResolvable = require('./modules/media/MediaResolvable')
const MediaResolver = require('./modules/MediaResolver')
const Playlist = require('./modules/media/Playlist')
const Song = require('./modules/media/Song')

var Tzuyu = new Bot()

Tzuyu.login(process.env.BOT_TOKEN)

var playRequest = YouTube.parsePlayRequest('https://www.youtube.com/watch?v=7hzIF8npWTc')
expect(playRequest instanceof MediaResolvable)
expect(playRequest).toEqual(new MediaResolvable('youtube#video', '7hzIF8npWTc'))

isMakingAsyncRequest = true
MediaResolver.resolve(playRequest).then(song => {
  expect(song instanceof Song)
  expect(song).toEqual(new Song('Mada Mada song', '7hzIF8npWTc'))
  isMakingAsyncRequest = false
})

playRequest = YouTube.parsePlayRequest('https://www.youtube.com/playlist?list=PLQI-1xShgqUKXYHOwjicC-zVOcKb_t9gs')
expect(playRequest).toEqual(new MediaResolvable('youtube#playlist', 'PLQI-1xShgqUKXYHOwjicC-zVOcKb_t9gs'))
MediaResolver.resolve(playRequest).then(playlist => {
  expect(playlist instanceof Playlist)
})

isMakingAsyncRequest = true
YouTube.search('ypM7qHf7zQw', (url, title) => {
  expect(url).toEqual('https://youtube.com/watch?v=ypM7qHf7zQw')
  expect(title).toEqual('Genji Circulation')
  isMakingAsyncRequest = false
  // i love testing
})

// end tests...

function waitForAsyncTests (times) {
  if (isMakingAsyncRequest) {
    console.log('waiting on async tests...')
    if (times > timeout / 500) {
      console.error('Async requests timed out...')
      process.exit(0)
    }
    setTimeout(() => {
      if (!times) { times = 0 }

      waitForAsyncTests(times + 1)
    }, 500)
  } else {
    console.log('all tests passed')
    process.exit(0)
  }
}

waitForAsyncTests()
