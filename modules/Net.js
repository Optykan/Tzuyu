'use strict';

const f = require('node-fetch');

class Net{
	static fetch(url, params){
		var urlencoded = "";
		for(var i in params){
			urlencoded += "&"+i+"="+params[i]; //in the format &[key]=[value]
		}

		urlencoded = "?"+urlencoded.substring(1);

		return f(url+urlencoded).then(result => {
			return result.json(); //ensure a search isn't resulting no videos, making items[0] nil
		}).then(json => {
			return new Promise((resolve, reject)=>{
				resolve(json);
			});
			// callback(json);
		}).catch(e=>{
			console.error(e);
		});
	}
}

module.exports = Net;