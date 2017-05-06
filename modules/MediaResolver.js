'use strict';
const Net = require('./Net');
const YouTube = require('./YouTube');
const MediaResolvable = require("./media/MediaResolvable");

class MediaResolver{
	static resolve(mediaResolvable){
		if(!(mediaResolvable instanceof MediaResolvable)){
			throw new TypeError("Passed an instance of "+mediaResolvable.constructor.name); 
		}

		if(mediaResolvable.isVideo()){
			return new Promise((resolve, reject)=>{
				resolve(mediaResolvable.resolve());
			});
		}else if(mediaResolvable.isPlaylist()){
			var pl = mediaResolvable.resolve();
			return YouTube.parsePlaylist(pl.id, pl).then((playlist)=>{
				return new Promise((resolve, reject)=>{
					resolve(playlist);
				});
			});
		}else if(mediaResolvable.isSearch()){
			return YouTube.search(mediaResolvable.payload).then(resolvable=>{
				return new Promise((res, reject)=>{
					//resolve the promise (then = res) with a call to resolve (static resolve) with the resolvable
					res(MediaResolver.resolve(resolvable));
				});
			});
		}

	}

}

module.exports = MediaResolver;