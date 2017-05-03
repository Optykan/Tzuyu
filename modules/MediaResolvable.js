'use strict';

const Song = require("Song");

class MediaResolvable{
	constructor(type, payload, target){
		this.type = type;
		this.payload = payload;
		this.target = "yt";
	}
	resolve(){
		if(this.type == "playlist" && typeof this.payload == "object"){
		
		}
	}
}

module.exports = MediaResolvable;
