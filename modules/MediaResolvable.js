'use strict';

const Song = require("Song");

class MediaResolvable{
	constructor(type, payload, title, target){
		this.title = title;
		this.type = type;
		this.payload = payload;
		this.target = "yt";
	}
	resolve(){
		if(this.isVideo()){
			return new Song(this.title, this.payload);
		}else if(this.isPlaylist()){
			return new Playlist()
		}
	}
	isVideo(){
		return this.type.search("video") != -1;
	}
	isPlaylist(){
		return this.type.search("playlist") != -1;
	}
}

module.exports = MediaResolvable;
