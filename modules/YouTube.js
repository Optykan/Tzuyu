//youtube stuff

const fetch = require('node-fetch');

//we're looking for:
//https://www.googleapis.com/youtube/v3/search?part=snippet&q=KEYWORD&key=YT_API_KEY
class YouTube {
	constructor(key){
		this.opts={
			key:key
		};
		this.playlistStore=[];
	}
	parsePlayRequest(params){
		//accepts the part after the %play command
		if(/https?:\/\/(?:www\.)?youtube\.(?:.+?)\/watch/.exec(params)){
			//its a youtube url
			var playlist = /https?:\/\/(?:www\.)?youtube\.(?:.+?)\/watch(?:.*?)&list=(.*)/.exec(params);
			if(playlist){
				return {
					type: 'playlist',
					payload: playlist[1]
				}
			}else{
				return {
					type: 'direct',
					payload: params
				};
			}
		}else if(/https?:\/\/(?:www\.)?youtu\.be\//.exec(params)){
			//its a youtu.be url
			if(/https?:\/\/(?:www\.)?youtu\.be\/(?:.*?)&list=(.*)/.exec(params)){
				return {
					type: 'playlist',
					payload: playlist[1]
				}
			}else{
				return {
					type: 'direct',
					payload: params
				};
			}
		}else{
			return {
				type: 'search',
				payload: params
			};
		}
	}

	_fetch(url, params, callback){
		if (typeof callback !== 'function'){
			console.warn("no callback function defined for "+url);
			return false;
		}
		var urlencoded = "";
		
		//urlencode the params
		for(var i in params){
			urlencoded += "&"+i+"="+params[i]; //in the format &[key]=[value]
		}

		urlencoded = "?"+urlencoded.substring(1);

		fetch(url+urlencoded+'&key='+this.opts.key).then(result => {
			return result.json(); //ensure a search isn't resulting no videos, making items[0] nil
		}).then(json => {
			callback(json);
		}).catch(e=>{
			console.error(e);
		});
	}
	search (term,callback){
		var params = {
			part: "snippet",
			q: term
		};

		this._fetch("https://www.googleapis.com/youtube/v3/search", params, json=>{
			var url =""; //the result url
			var title = "song title";
			//do stuff
			callback(url, title);
		});
	}

	_parsePlaylistThroughPages(token, playlistId, callback){
		var params = {
			part: 'snippet',
			playlistId: playlistId,
			maxResults: 50,
			pageToken: token
		};

		this._fetch("https://www.googleapis.com/youtube/v3/playlistItems", params, json=>{
			if(!json.errors && json.items && json.items[0]){
				for(let i=0; i<json.items.length; i++){
					this.playlistStore.push({
						title: json.items[i].snippet.title,
						url: "https://www.youtube.com/watch?v="+json.items[i].snippet.resourceId.videoId
					});
				}
			}
			if(json.nextPageToken){
				this._parsePlaylistThroughPages(json.nextPageToken, playlistId);
			}else{
				callback(this.playlistStore);
			}
		});
	}
	parsePlaylist(playlistId, callback){
		this.playlistStore=[];
		var params = {
			part: 'snippet',
			playlistId: playlistId,
			maxResults: 50
		};
		this._fetch("https://www.googleapis.com/youtube/v3/playlistItems", params, json=>{
			if(!json.errors && json.items && json.items[0]){
				for(let i=0; i<json.items.length; i++){
					this.playlistStore.push({
						title: json.items[i].snippet.title,
						url: "https://www.youtube.com/watch?v="+json.items[i].snippet.resourceId.videoId
					});
				}
				if(json.nextPageToken){
					console.log("searching through token:"+json.nextPageToken);
					this._parsePlaylistThroughPages(json.nextPageToken, playlistId, callback);
				}else{
					callback(this.playlistStore);
				}
			}else{
				callback([]);
			}
		});
	}
	
}

module.exports = YouTube;