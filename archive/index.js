/*
bot-message-parser.js

a tool to output a bot command/trigger and the text of the message

var text = '!bot hello there'
var input = new BotMessageParser(text)
console.log(input)

*/

function BotMessageParser(input, settings = {}) {
	// var settings = settings || {}
	var customDict;
	if (settings.customDict == undefined) {
		customDict = undefined;
	};

	this.raw = "";
	this.text = "";
	this.clean = "";
	this.hasTrigger = "";
	this.trigger = "";
	this.arguments = [];

	settings.allowTriggerInMessage = settings.allowTriggerInMessage || false;

	if (input == undefined) {
		return
	} else 
	if (typeof input !== 'string') {
		throw new Error('input must be a string!');
	};
	input = input.trim()
	if (input == "" || input == undefined) {
		this.trigger = false;
		this.text = false;
	};

	var default_dict = {
		"u": "you",
		"belive": "believe",
		"beleive": "believe",
		"r": "are",
		"wot": "what",
		"wut": "what",
		"wots": "whats",
		"fuk": "fuck",
		"suk": "suck",
		"suks": "sucks",
		"sux": "sucks",
		"wat": "what",
		"o": "oh",
		"k": "ok",
		"kk": "ok",
		"okie": "ok",
		"hehe": "haha",
		"hah": "haha",
		"heh": "haha",
		"nah": "no",
		"ye": "yes",
		"yea": "yes",
		"sik": "sick",
		"thx": "thanks",
		"ur": "your",
		"m8": "mate",
		"&": "and",
	};

	var dictionary = settings.dictionary || default_dict


	this.raw = input;
	this.text = input;
	// TRIGGER
	if (!this.allowTriggerInMessage) {
		if (input.match(/^!\b.+?\b/g)) {
			let _trigger = input.match(/^!\b.+?\b/g)[0];
			this.hasTrigger = true;
			this.trigger = input.match(/^!\b.+?\b/g)[0].toLowerCase();
			this.text = input.replace(_trigger, '').trim();
			if (this.text == "") {
				this.text = "";
			}
			this.arguments = this.text.split(" ")
		} else {
			this.trigger = false;
			this.hasTrigger = false;
		};
	} else {
		if (input.match(/!\b.+?\b/g)) {
			let _trigger = input.match(/^!\b.+?\b/g)[0];
			this.hasTrigger = true;
			this.trigger = input.match(/^!\b.+?\b/g)[0].toLowerCase();
			this.text = input.replace(_trigger, '').trim();
			this.clean;
			if (this.text == "") {
				this.text = "";
			}
			this.arguments = this.text.split(" ")
		} else {
			this.trigger = false;
			this.hasTrigger = false;
		};
	};

	var words = this.text
	.toLowerCase()
	.replace("&", "and")
	.replace(/[^\w\s]|_/g, '')
	.replace(/\s+/g, ' ') 
	.split(" ");
	var newstring = [];

	for (let x of words) {
		if (x in dictionary) {
			x = dictionary[x];
		};
		if (customDict) {
			if (x in settings.customDict) {
				x = settings.customDict[x];
			}
		}

		newstring.push(x);
	};


	this.clean = newstring.join(" ")

	

	if (!this.trigger && input) {
		this.text = input;
	};
}

module.exports = BotMessageParser

// var x = new BotMessageParser("!hello world how are you?")

// console.log(x)
