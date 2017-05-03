'use strict';

class Song{
	constructor(title, url){
		this.title = title;
		this.url = url;
	}

	setUrl(url){
		this.url=url;
	}
	getUrl(){
		return this.url;
	}
	setTitle(title){
		this.title=title;
	}
	getTitle(){
		return this.title;
	}

	resolveTitleFromMessage(message, callback, tries){
		if(message.embeds[0] && message.embeds[0].title){
			this.title=message.embeds[0].title;
			callback(this);
		}else if(!tries || tries < 3){
			var that=this;
			return setTimeout(()=>{
				if(!tries){
					tries = 0;
				}
				that.resolveTitleFromMessage(message, callback, tries+1);
			}, 500);
		}else{
			//maybe catch something here?
			callback(this);
		}
	}
}

module.exports = Song;