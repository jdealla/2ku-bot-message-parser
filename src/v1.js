
const path = require("path")
const Logger = require("rf-logger");
const logger = new Logger(path.basename(__filename));

const Compromise = require("compromise")
var { NlpManager } = require('node-nlp');
var nlp = new NlpManager({ languages: ['en'], nlu: { log: true } });
module.exports = nlp







/*
bot-message-parser.js

a tool to output a bot command/trigger and the text of the message

var text = '!bot hello there'
var input = new BotMessageParser(text)
console.log(input)

*/

class BotMessageParser {

	constructor(settings = {}) {
		var model = settings.model
		this.settings = settings
		if (!model) {
			this.settings.nlpActive = false 
		} else {
			this.settings.nlpActive = true 
		}

		this.settings.useCompromise = settings.useCompromise || false
		this.settings.customDict = settings.customDict
		this.settings.debug = settings.debug
		this.settings.allowTriggerInMessage = settings.allowTriggerInMessage || false
		if (model) {
			nlp.load(model);
		}
	}

	async process (input) {
		var defaultDict = require("./replaceWords.js")

		if (this.debug) logger.debug("input: " + input)
		this.raw = undefined;
		this.text = undefined;
		this.clean = undefined;
		this.hasTrigger = "";
		this.triggerOnly = undefined;
		this.trigger = undefined;
		this.intent = undefined;
		this.numEntities = 0;
		this.entities = [];
		this.sentiment = undefined;
		this.arguments = [];
		this.verbs = [];
		this.nouns = [];
		this.hashTags = [];
		this.urls = []
		this.emails = []
		this.phoneNumbers = []

		// this.settings.allowTriggerInMessage = settings.allowTriggerInMessage || false;

		if (input == undefined) {
			return
		} else 
		if (typeof input !== 'string') {
			throw new Error('input must be a string!');
		};
		input = input.trim()
		if (input == "" || input == undefined) {
			this.trigger = undefined;
			this.text = false;
		};

		var dictionary = this.settings.customDict || defaultDict

		// compromise
		if (this.settings.useCompromise) {
			let compromise = Compromise(input);
			// compromise
			this.verbs = compromise.verbs().out("array")
			this.nouns = compromise.nouns().out("array")
			this.hashTags = compromise.hashTags().out("array")
			this.urls = compromise.urls().out("array")
			this.emails = compromise.emails().out("array")
			this.phoneNumbers = compromise.phoneNumbers().out("array")
		}

		// nlp
		if (this.settings.nlpActive) {
			let nlpOutput = await nlp.process(input)
			if (this.debug) logger.debug(nlpOutput)
			this.intent = nlpOutput.intent;
			this.entities = parseEntities(nlpOutput.entities);
			this.numEntities = this.entities.length
			this.sentiment = nlpOutput.sentiment.vote
		}
		// text
		this.raw = input;
		this.text = input;
		// TRIGGER
		if (!this.settings.allowTriggerInMessage) {
			if (this.debug) logger.debug("trigger is not allowed in message body")
			if (input.match(/^!\b.+?\b/g)) {
				if (this.debug) logger.debug("message has trigger")
				let _trigger = input.match(/^!\b.+?\b/g)[0];
				this.hasTrigger = true;
				this.trigger = input.match(/^!\b.+?\b/g)[0].toLowerCase();
				this.text = input.replace(_trigger, '').trim();
				if (this.text == "") {
					this.text = "";
				}

				// if (this.text.split("").length > 4) {
				// 	this.arguments = []
				// } else {
				// 	this.arguments = this.text.split(" ")
				// }
			} else {
				if (this.debug) logger.debug("message does NOT have trigger")
				this.trigger = undefined;
				this.hasTrigger = false;
			};
		} else {
			if (input.match(/!\b.+?\b/g)) {
				let _trigger = input.match(/^!\b.+?\b/g)[0];
				if (this.debug) logger.debug("message has trigger")
				this.hasTrigger = true;
				this.trigger = input.match(/^!\b.+?\b/g)[0].toLowerCase();
				this.text = input.replace(_trigger, '').trim();
				this.clean;
				if (this.text == "") {
					this.text = "";
				}
				// if (this.text.split("").length > 4) {
				// 	this.arguments = []
				// } else {
				// 	this.arguments = this.text.split(" ")
				// }
			} else {
				if (this.debug) logger.debug("message does NOT have trigger")
				this.trigger = undefined;
				this.hasTrigger = false;
			};
		};


		var words = this.text
		.toLowerCase()
		.replace("&", "and")
		.replace(/[^\w\s]|_/g, '') // replace whitespace?
		.replace(/\s+/g, ' ')
		.trim()
		.split(" ");
		var newstring = [];
		words.forEach(userWord => {
			if (defaultDict.has(userWord)) {
				userWord = defaultDict.get(userWord)
				newstring.push(userWord)
			} else {
				newstring.push(userWord)
			}
		})

		// for (let word of words) {
		// 	if (word in dictionary) {
		// 		word = defaultDict.get(word);
		// 	};
		// 	if (this.settings.customDict) {
		// 		if (word in this.settings.customDict) {
		// 			word = this.settings.customDict[x];
		// 		}
		// 	}

		// 	newstring.push(word);
		// };

		if (!this.text) {
			this.triggerOnly = true
		} else {
			this.triggerOnly = false
		}

		this.clean = newstring.join(" ")

		// push words to arguments
		if (this.clean) {
			this.arguments = this.text.replace(/\s+/g, ' ').split(" ")
		} else if (!this.trigger) {
			this.arguments = []
		}

		if (!this.trigger && input) {
			this.text = input;
		};
		return this
	}; // END PARSE
}; // END CLASS

function parseEntities(array){
	// this is a proxy for the nlp.js entities
	let output = []
	for (let entity of array) {
		let parsedEntity = {
			entity: entity.entity,
			option: entity.option,
			sourceText: entity.sourceText,
			utteranceText: entity.utteranceText
		}
		output.push(parsedEntity)
	}
	return output
}

module.exports = BotMessageParser
