'use strict';
const Net = require('./Net');
const YouTube = require('./YouTube');

class MediaResolver{
	construtor(mediaResolvable){
		if(!(mediaResolvable instanceof MediaResolvable)){
			throw new TypeError("Passed an instance of "+mediaResolvable.name); 
		}
		this.media = mediaResolvable;
		this.youtube = new YouTube(proces.env.YT_API_KEY);
	}
	resolve(){
		if(this.media.isVideo()){
			return this.media.resolve();
		}else if(this.media.isPlaylist()){
			var pl = this.media.resolve();
			return this.youtube.parsePlaylist(pl.id).then(array=>{
				return new Promise((resolve, reject)=>{
					resolve(array);
				});
			});
		}

	}

}

module.exports = MediaResolver;