// youtube stuff
const MediaResolvable = require('./media/MediaResolvable')
const Net = require('./Net')
const Song = require('./media/Song')
// we're looking for:
// https://www.googleapis.com/youtube/v3/search?part=snippet&q=KEYWORD&key=YT_API_KEY
class YouTube {
  static get apikey () {
    return process.env.YT_API_KEY
  }

  static parsePlayRequest (params) {
    // accepts the part after the %play command
    if (/https?:\/\/(?:www\.)?youtube\.(?:.+?)\/watch/.exec(params)) {
      // its a youtube url
      let regex = /https?:\/\/(?:www\.)?youtube\.(?:.+?)\/watch\?v=(.*?)(?:&list=(.*))?$/.exec(params)
      if (regex[2]) {
        return new MediaResolvable('youtube#playlist', regex[2])
      } else {
        return new MediaResolvable('youtube#video', regex[1])
        // shitty naming conventions right here      ^^^^^^^^^^^
      }
    } else if (/https?:\/\/(?:www\.)?youtu\.be\//.exec(params)) {
      // its a youtu.be url
      let regex = /https?:\/\/(?:www\.)?youtu\.be\/(.*?)(?:&list=(.*))?$/.exec(params)
      if (regex[2]) {
        return new MediaResolvable('youtube#playlist', regex[2])
      } else {
        return new MediaResolvable('youtube#video', regex[1])
      }
    } else if (/https?:\/\/(?:www)?\.youtube\.com\/playlist\?list=(.*)/.exec(params)) {
      var playlist = /https?:\/\/(?:www)?\.youtube\.com\/playlist\?list=(.*)/.exec(params)
      return new MediaResolvable('youtube#playlist', playlist[1])
    } else {
      return new MediaResolvable('youtube#search', params)
    }
  }

  static getTitle (videoId) {
    var params = {
      part: 'snippet',
      id: videoId,
      key: YouTube.apikey
    }
    return Net.fetch('https://www.googleapis.com/youtube/v3/videos', params).then(json => {
      return new Promise((resolve, reject) => {
        if (!json.errors && json.pageInfo.totalResults > 0) {
          resolve(json.items[0].snippet.title)
        } else {
          reject(new Error('No video found'))
        }
        resolve()
      })
    })
  }

  static search (term) {
    var params = {
      part: 'snippet',
      q: encodeURIComponent(term),
      key: YouTube.apikey
    }

    return Net.fetch('https://www.googleapis.com/youtube/v3/search', params).then(json => {
      if (!json.errors && json.pageInfo.totalResults > 0) {
        return new Promise((resolve, reject) => {
          if (json.items[0].id.kind === 'youtube#playlist') {
            resolve(new MediaResolvable(json.items[0].id.kind, json.items[0].id.playlistId, json.items[0].snippet.title))
          } else if (json.items[0].id.kind === 'youtube#video') {
            resolve(new MediaResolvable(json.items[0].id.kind, json.items[0].id.videoId, json.items[0].snippet.title))
          } else {
            reject(new Error('No playable media found'))
          }
        })
      }
    })
  }

  static parsePlaylist (playlistId, playlist, token) {
    this.playlistStore = []
    var params = {
      part: 'snippet',
      playlistId: playlistId,
      maxResults: 50,
      key: YouTube.apikey
    }
    if (token) {
      params.pageToken = token
    }
    return Net.fetch('https://www.googleapis.com/youtube/v3/playlistItems', params).then(json => {
      if (!json.errors && json.items && json.items[0]) {
        for (let i = 0; i < json.items.length; i++) {
          playlist.push(new Song(json.items[i].snippet.resourceId.videoId, json.items[i].snippet.title))
        }
        if (json.nextPageToken) {
          console.log('searching through token: ' + json.nextPageToken)
          return YouTube.parsePlaylist(playlistId, playlist, json.nextPageToken)
        } else {
          return new Promise((resolve, reject) => {
            // because js allegedly passes objects by pointers or something but just in case
            resolve(playlist)
          })
        }
      } else {
        return new Promise((resolve, reject) => {
          reject(new Error('No playlist found'))
        })
      }
    })
  }
}

module.exports = YouTube
