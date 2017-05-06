//youtube stuff
const MediaResolvable = require('./media/MediaResolvable');
const Net = require('./Net');
const Song = require('./media/Song');
const Playlist = require('./media/Playlist');

//we're looking for:
//https://www.googleapis.com/youtube/v3/search?part=snippet&q=KEYWORD&key=YT_API_KEY
class YouTube {
	static get apikey(){
		return process.env.YT_API_KEY;
	}

	static parsePlayRequest(params){
		//accepts the part after the %play command
		if(/https?:\/\/(?:www\.)?youtube\.(?:.+?)\/watch/.exec(params)){
			//its a youtube url
			var playlist = /https?:\/\/(?:www\.)?youtube\.(?:.+?)\/watch(?:.*?)&list=(.*)/.exec(params);
			if(playlist){
				return new MediaResolvable('youtube#playlist', playlist[1]);
			}else{
				return new MediaResolvable('youtube#video', params);
			}
		}else if(/https?:\/\/(?:www\.)?youtu\.be\//.exec(params)){
			//its a youtu.be url
			var playlist = /https?:\/\/(?:www\.)?youtu\.be\/(?:.*?)&list=(.*)/.exec(params);
			if(playlist){
				return new MediaResolvable('youtube#playlist', playlist[1]);
			}else{
				return new MediaResolvable('youtube#video', params);
			}
		}else if(/https?:\/\/(?:www)?\.youtube\.com\/playlist\?list=(.*)/.exec(params)){
			var playlist = /https?:\/\/(?:www)?\.youtube\.com\/playlist\?list=(.*)/.exec(params);
			return new MediaResolvable('youtube#playlist', playlist[1]);
		}
		else{
			return new MediaResolvable('youtube#search', params);
		}
	}

	static search (term){
		var params = {
			part: "snippet",
			q: encodeURIComponent(term),
			key: YouTube.apikey
		};

		return Net.fetch("https://www.googleapis.com/youtube/v3/search", params).then(json=>{
			if(json.pageInfo.totalResults > 0){
				return new Promise((resolve, reject)=>{
					if(json.items[0].id.kind == "youtube#playlist"){
						resolve(new MediaResolvable(json.items[0].id.kind, json.items[0].id.playlistId, json.items[0].snippet.title));
					}else if(json.items[0].id.kind == "youtube#video"){
						resolve(new MediaResolvable(json.items[0].id.kind, json.items[0].id.videoId, json.items[0].snippet.title));
					}else{
						reject("No playable media found");
					}
				});
			}
		});

		// this._fetch("https://www.googleapis.com/youtube/v3/search", params, json=>{
		// 	if(json.items[0]){
		// 		if(json.items[0].id.kind == "youtube#playlist"){
		// 			callback(new MediaResolvable('playlist', json.items[0].id.playlistId));
		// 		}else if(json.items[0].id.kind == "youtube#video"){
		// 			callback(new MediaResolvable('playlist', json.items[0].id.videoId));
		// 		}
		// 		// var url ="https://youtube.com/watch?v="+json.items[0].id.videoId; //the result url
		// 		// var title = json.items[0].snippet.title;
		// 		// return new Promise((resolve, reject)=>{

		// 		// });
		// 		callback(url, title);
		// 	}
		// });
	}

	// static _parsePlaylistThroughPages(token, playlistId, callback){
	// 	var params = {
	// 		part: 'snippet',
	// 		playlistId: playlistId,
	// 		maxResults: 50,
	// 		pageToken: token
	// 	};

	// 	Net.fetch("https://www.googleapis.com/youtube/v3/playlistItems", params).then(json=>{
	// 		if(!json.errors && json.items && json.items[0]){
	// 			for(let i=0; i<json.items.length; i++){
	// 				this.playlistStore.push({
	// 					title: json.items[i].snippet.title,
	// 					url: "https://www.youtube.com/watch?v="+json.items[i].snippet.resourceId.videoId
	// 				});
	// 			}
	// 		}
	// 		if(json.nextPageToken){
	// 			this._parsePlaylistThroughPages(json.nextPageToken, playlistId, callback);
	// 		}else{
	// 			callback(this.playlistStore);
	// 		}
	// 	});
	// }
	static parsePlaylist(playlistId, playlist, token){
		this.playlistStore=[];
		var params = {
			part: 'snippet',
			playlistId: playlistId,
			maxResults: 50,
			key: YouTube.apikey
		};
		if(token){
			params.pageToken = token;
		}
		return Net.fetch("https://www.googleapis.com/youtube/v3/playlistItems", params).then(json=>{
			if(!json.errors && json.items && json.items[0]){
				for(let i=0; i<json.items.length; i++){
					playlist.push(new Song(json.items[i].snippet.title, json.items[i].snippet.resourceId.videoId));
				}
				if(json.nextPageToken){
					console.log("searching through token: "+json.nextPageToken);
					return YouTube.parsePlaylist(playlistId, playlist, json.nextPageToken);
				}else{
					return new Promise((resolve, reject)=>{
						//because js allegedly passes objects by pointers or something but just in case
						resolve(playlist);
					});
				}
			}else{
				return new Promise((resolve, reject)=>{
					reject([]);
				});
			}
		});
	}
	
}

module.exports = YouTube;