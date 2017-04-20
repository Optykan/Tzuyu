//youtube stuff

const fetch = require('node-fetch');

//we're looking for:
//https://www.googleapis.com/youtube/v3/search?part=snippet&q=KEYWORD&key=YT_API_KEY
class YouTube {
	constructor(key){
		this.opts={
			key:key
		};
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
		}).catch(console.error);
	}
	search (term,callback){
		var params = {
			part: "snippet",
			q: term
		};

		_fetch("https://www.googleapis.com/youtube/v3/search", params, json=>{
			var url =""; //the result url
			//do stuff
			callback(url);
		});
	}
	parsePlaylist(playlistId, callback){
		var res = [];
		var params = {
			part: 'snippet',
			playlistId: playlistId,
			maxResults: 50
		};
		_fetch(" https://www.googleapis.com/youtube/v3/playlistItems", params, json=>{
			if(!json.errors && json.items[0]){
				for(let i=0; i<json.items.length; i++){
					res.push({
						title: json.items[i].snippet.title,
						url: json.items[i].snippet.resourceId.videoId
					});
				}
			}
		});
	}
	
}

module.exports = YouTube;