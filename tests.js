var expect = require('expect');
var createSpy = expect.createSpy;
var spyOn = expect.spyOn;
var isSpy = expect.isSpy;
//is this how you do tests?

var timeout = 15000; //how to long to wait for async tests to complete
var isMakingAsyncRequest = false;

console.log("beginning tests");

require('dotenv').config();

const Bot = require('./modules/Bot');
const Discord = require('discord.js');
const YouTubeInterface = require('./modules/YouTube');

var Tzuyu = new Bot();
var YouTube = new YouTubeInterface(process.env.YT_API_KEY);

Tzuyu.login(process.env.BOT_TOKEN);

var playRequest = YouTube.parsePlayRequest("https://www.youtube.com/watch?v=7hzIF8npWTc");
expect(playRequest).toEqual({
	type: 'direct',
	payload: "https://www.youtube.com/watch?v=7hzIF8npWTc"
});

playRequest = YouTube.parsePlayRequest("https://www.youtube.com/playlist?list=PLQI-1xShgqUKXYHOwjicC-zVOcKb_t9gs");
expect(playRequest).toEqual({
	type: 'playlist',
	payload: "PLQI-1xShgqUKXYHOwjicC-zVOcKb_t9gs"
});


isMakingAsyncRequest = true;
YouTube.search("ypM7qHf7zQw", (url, title)=>{
	expect(url).toEqual("https://youtube.com/watch?v=ypM7qHf7zQw");
	expect(title).toEqual("Genji Circulation");
	isMakingAsyncRequest = false;
	//i love testing
});



//end tests...

function waitForAsyncTests(times){
	if(isMakingAsyncRequest){
		console.log("waiting on async tests...");
		if(times > timeout/500){
			console.error("Async requests timed out...");
			process.exit(0);
		}
		setTimeout(()=>{
			if(!times)
				times = 0;

			waitForAsyncTests(times+1);
		}, 500);
	}else{
		console.log("all tests passed");
		process.exit(0);
	}
}

waitForAsyncTests();