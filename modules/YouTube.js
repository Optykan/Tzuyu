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
	search (term,callback){
		return fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q='+term+'&key='+key)
		//is this how strings work
		//			return result.json.items[0].videoId();
		.then(function(result) { //what???
			return result.json(); //ensure a search isn't resulting no videos, making items[0] nil
		})
		.then(function(json) {
			callback(json);
		})
		.catch(console.error);
	}
	
}

module.exports = YouTube;