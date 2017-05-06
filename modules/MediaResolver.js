'use strict';
const Net = require('./Net');
const YouTube = require('./YouTube');

class MediaResolver{
	static resolve(mediaResolvable){
		if(!(mediaResolvable instanceof MediaResolvable)){
			throw new TypeError("Passed an instance of "+mediaResolvable.constructor.name); 
		}

		if(this.media.isVideo()){
			return mediaResolvable.resolve();
		}else if(mediaResolvable.isPlaylist()){
			var pl = mediaResolvable.resolve();
			return YouTube.parsePlaylist(pl.id, pl).then(()=>{
				return new Promise((resolve, reject)=>{
					resolve(pl);
				});
			});
		}else if(mediaResolvable.isSearch()){
			return YouTube.search(mediaResolvable.payload).then(song=>{
				return new Promise((resolve, reject)=>{
					resolve(song);
				});
			})
		}

	}

}

module.exports = MediaResolver;