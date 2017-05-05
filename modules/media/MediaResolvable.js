'use strict';

const Song = require("./Song");
const Playlist = require("./Playlist");

class MediaResolvable{
	constructor(type, id, title, target){
		this.title = title;
		this.type = type;
		this.id = id;
		this.target = "yt";
	}
	resolve(){
		if(this.isVideo()){
			return new Song(this.title, this.id);
		}else if(this.isPlaylist()){
			return new Playlist(this.id);
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
