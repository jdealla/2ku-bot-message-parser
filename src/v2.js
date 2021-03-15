// v2

const fs = require("fs")
const path = require("path")
const Logger = require("rf-logger");
const logger = new Logger(path.basename(__filename));

const Compromise = require("compromise")
var { NlpManager } = require('node-nlp');
var nlp = new NlpManager({ 
	languages: ['en'], 
	nlu: { 
		log: true,
		useNoneFeature: true,
		useNeural: false,
		keepStopwords: true,
		spellcheck: true
	} 
});
var nlpDefault = new NlpManager({ 
	languages: ['en'], 
	nlu: { 
		log: true,
		useNoneFeature: true,
		useNeural: false,
		keepStopwords: true,
		spellcheck: true
	}
});
module.exports = nlp

/*
bot-message-parser.js

a tool to output a bot command/command and the text of the message

var text = '!bot hello there'
var input = new BotMessageParser(text)
console.log(input)

*/

function BotMessageParser(settings = {}) {

	// settings
	let defaultReplaceWordsList = require("./replaceWords.js");
	let namesList = settings.namesList || undefined;
	let teamsList = settings.teamsList || undefined;
	let playersList = settings.playersList || undefined;
	let datesList = settings.datesList || undefined;
	let yearsList = settings.yearsList || undefined;
	let overallsList = settings.overallsList || undefined;
	let betsList = settings.betsList || undefined;
	let actionsList = settings.actionsList || undefined;
	var commandPrefix = settings.commandPrefix || "!";
	let botUserId = settings.botUserId || undefined
	let model = settings.model;
	let nlpActive = (model) ? true : false;
	let useCompromise = settings.useCompromise || false;
	let customDict = settings.customDict;
	let replaceWordsList = settings.replaceWords || defaultReplaceWordsList;
	let debug = settings.debug || false;
	let allowCommandInMessage = settings.allowCommandInMessage || false;
	let nlpDefaultModel = __dirname + "/yesno.nlp"
	// if (model) nlp.load(model)
	if (model) {
		let data = fs.readFileSync(model, "utf8")
		nlp.import(data)
	}
	nlpDefault.load(nlpDefaultModel)

	// PROCESS
	this.process = async function (input) {
		// setup
		var defaultDict = require("./replaceWords.js")
		var dictionary = customDict || defaultDict
		let commandRegexPattern = `^\\${commandPrefix}\\b.+?\\b`
		let commandRegex = new RegExp(commandRegexPattern, "gi")
		if (debug) logger.debug("input: " + input)
		if (input == undefined) return
		else if (typeof input !== 'string') throw new Error('input must be a string!');

		input = input.trim()
		this.id = undefined;
		this.type = undefined;
		this.timestamp = undefined;
		this.raw = undefined;
		this.text = undefined;
		this.clean = undefined;
		this.attachments = undefined;
		this.hasCommand = "";
		this.commandOnly = undefined;
		this.command = undefined;
		this.commandRaw = undefined;
		this.commandWord = undefined;
		this.botMentioned = undefined;
		this.yes = undefined;
		this.no = undefined;
		this.maybe = undefined;
		this.idk = undefined;
		this.what = undefined;
		this.arguments = [];
		this.names = [];
		this.teams = [];
		this.players = [];
		this.hasIntent = undefined
		this.intent = undefined;
		this.numEntities = 0;
		this.entities = [];
		this.sentiment = undefined;
		this.verbs = [];
		this.nouns = [];
		this.hashtags = [];
		this.urls = [];
		this.emails = [];
		this.phoneNumbers = [];

		
		if (input == "" || input == undefined) {
			this.command = undefined;
			this.text = false;
		};

		// COMPROMISE
		if (useCompromise) {
			if (debug) logger.debug("getting compromise data...");
			let compromise = Compromise(input);
			// compromise
			this.verbs = compromise.verbs().out("array");
			this.nouns = compromise.nouns().out("array");
			this.hashtags = compromise.hashTags().out("array");
			this.urls = compromise.urls().out("array");
			this.emails = compromise.emails().out("array");
			this.phoneNumbers = compromise.phoneNumbers().out("array");
		};

	
		// text
		this.raw = input;
		this.text = input;

		// TRIGGER
		if (!allowCommandInMessage) {
			if (debug) logger.debug("getting command...");
			if (debug) logger.debug("command is not allowed in message body");
			if (input.match(commandRegex)) {
				if (debug) logger.debug("message has command");

				let _command = input.match(commandRegex)[0];
				this.hasCommand = true;
				this.commandRaw = input.match(commandRegex)[0].toLowerCase();
				this.command = this.commandRaw.replace(commandPrefix, "").trim()
				this.text = input.replace(_command, '').trim();
				if (this.text == "") {
					this.text = "";
				}
			} 
			else {
				if (debug) logger.debug("message does NOT have command")
				this.command = undefined;
				this.hasCommand = false;
			};
		} 
		else {
			if (debug) logger.debug("getting command...")
			if (input.match(commandRegex)) {
				let _command = input.match(commandRegex)[0];
				if (debug) logger.debug("message has command")
				this.hasCommand = true;
				this.commandRaw = input.match(commandRegex)[0].toLowerCase();
				this.command = this.commandRaw.replace(commandPrefix, "").trim()
				this.text = input.replace(_command, '').trim();
				this.clean;
				if (this.text == "") {
					this.text = "";
				}
			} 
			else {
				if (debug) logger.debug("message does NOT have command")
				this.command = undefined;
				this.commandRaw = undefined;
				this.hasCommand = false;
			};
		};

		// replace words
		if (debug) logger.debug("replacing words...")
		this.clean = replaceWords(this.text)
		if (!this.text) this.commandOnly = true
		else this.commandOnly = false
		if (namesList) this.names = findNames(this.clean, namesList)
		if (teamsList) this.teams = findTeams(this.clean, teamsList)
		if (playersList) this.players = findPlayers(this.clean, playersList)
		if (datesList) this.dates = findDates(this.text, datesList)
		if (yearsList) this.years = findYears(this.clean, yearsList)
		if (overallsList) this.overalls = findOveralls(this.clean, overallsList)
		if (betsList) this.bets = findBets(this.raw, betsList)
		if (actionsList) this.actions = findActions(this.clean, actionsList)

		// push words to arguments
		if (this.text) this.arguments = this.text.replace(/\s+/g, ' ').split(" ");
		else if (!this.command) this.arguments = [];

		// if no command but there was input, set text to input
		if (!this.command && input) this.text = input;

		let nlpDefaultOutput = await nlpDefault.process(this.clean)
		// console.log(nlpDefaultOutput)
		if (nlpDefaultOutput.intent == "yes") {
			this.yes = true;
			this.no = false;
			this.maybe = false;
		}
		else if (nlpDefaultOutput.intent == "no") {
			this.yes = false;
			this.no = true;
			this.maybe = false;
		}
		else if (nlpDefaultOutput.intent == "maybe") {
			this.yes = false;
			this.no = false;
			this.maybe = true;
		}
		if (nlpDefaultOutput.intent == "idk") {
			this.idk = true;
		};
		if (nlpDefaultOutput.intent == "what") {
			this.what = true;
		};

		// NLP
		if (nlpActive) {
			if (debug) logger.debug("getting NLP data...")
			let nlpOutput = await nlp.process(this.clean);
			if (debug) logger.debug(nlpOutput);
			if (!nlpOutput.intent || nlpOutput.intent == "None") {
				this.hasIntent = false;
			} else {
				this.hasIntent = true;
			};

			this.intent = nlpOutput.intent;
			this.entities = parseEntities(nlpOutput.entities);
			this.numEntities = this.entities.length;
			this.sentiment = nlpOutput.sentiment.vote;
		};

		let output = {
			id: this.id,
			type: this.type,
			timestamp: this.timestamp,
			raw: this.raw,
			text: this.text,
			clean: this.clean,
			attachments: this.attachments,
			command: this.command,
			commandRaw: this.commandRaw,
			hasCommand: this.hasCommand,
			commandOnly: this.commandOnly,
			botMentioned: this.botMentioned,
			yes: this.yes,
			no: this.no,
			maybe: this.maybe,
			idk: this.idk,
			what: this.what,
			arguments: this.arguments,
			names: this.names,
			teams: this.teams,
			players: this.players,
			dates: this.dates,
			years: this.years,
			bets: this.bets,
			overalls: this.overalls,
			actions: this.actions,
			hasIntent: this.hasIntent,
			intent: this.intent,
			numEntities: this.numEntities,
			entities: this.entities,
			sentiment: this.sentiment,
			hashtags: this.hashtags,
			urls: this.urls,
			emails: this.emails,
			phoneNumbers: this.phoneNumbers,
			verbs: this.verbs,
			nouns: this.nouns,
		};

		return output
	}; // END PARSE

	function replaceWords(input) {
		let output;
		let newString = [];
		let words = input
			.toLowerCase()
			.replace("&", "and")
			.replace(/[^\w\s]|_/g, '') // replace whitespace?
			.replace(/\s+/g, ' ')
			.trim()
			.split(" ")

		words.forEach(userWord => {
			if (replaceWordsList.has(userWord)) {
				userWord = replaceWordsList.get(userWord);
				newString.push(userWord);
			} else {
				newString.push(userWord);
			};
		});
		output = newString.join(" ");
		return output;
	}

}; // END CLASS

function parseEntities(array){
	// this is a proxy for the nlp.js entities
	let output = []

	array.forEach(entity => {
		let parsedEntity = {
			entity: entity.entity,
			option: entity.option,
			sourceText: entity.sourceText,
			utteranceText: entity.utteranceText
		}
		output.push(parsedEntity)
	})
	return output
}

function findNames(string, namesList) {
	if (!Array.isArray(namesList)) throw new Error("namesList must be an array")
	if (!string) return
	let matches = []
	namesList.forEach(name => {
		let match
		if (string.match(name)) {
			match = string.match(name)[0]
			matches.push(match)
		}
	})
	return matches
};

function findTeams(string, teamsList) {
	if (!Array.isArray(teamsList)) throw new Error("teamsList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	teamsList.forEach(name => {
		name = name.toLowerCase();
		let match
		if (string.split(' ').includes(name)) {
			match = name;
			matches.push(match)
		}
	});
	return matches
};

function findPlayers(string, playersList) {
	if (!Array.isArray(playersList)) throw new Error("playersList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	playersList.forEach(name => {
		name = name.toLowerCase();
		let match
		if (string.match(name)) {
			match = string.match(name)[0]
			matches.push(match)
		}
	})
	return matches
};

function findDates(string, datesList) {
	if (!Array.isArray(datesList)) throw new Error("datesList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	datesList.forEach(name => {
		let match
		const strArr = string.split(' ');
		strArr.forEach( str => {
			str = str.trim();
			if (str.match(name)) {
				match = str.match(name)[0]
				matches.push(match)
			}
		})
	})
	return matches
};

function findBets(string, betsList) {
	if (!Array.isArray(betsList)) throw new Error("betsList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	betsList.forEach(name => {
		let match
		const strArr = string.split(' ');
		strArr.forEach( str => {
			str = str.trim();
			if (str.match(name)) {
				match = str.match(name)[0]
				matches.push(match)
			}
		})
	})
	return matches
};

function findYears(string, yearsList) {
	if (!Array.isArray(yearsList)) throw new Error("yearsList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	yearsList.forEach(name => {
		let match
		const strArr = string.split(' ');
		strArr.forEach( str => {
			str = str.trim();
			if (str.match(name)) {
				match = str.match(name)[0]
				matches.push(match)
			}
		})
	})
	return matches
};

function findOveralls(string, overallsList) {
	if (!Array.isArray(overallsList)) throw new Error("overallsList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	overallsList.forEach(name => {
		let match
		const strArr = string.split(' ');
		strArr.forEach( str => {
			str = str.trim();
			if (str.match(name)) {
				match = str.match(name)[0]
				matches.push(match)
			}
		})
	})
	return matches
};

function findActions(string, actionsList) {
	if (!Array.isArray(actionsList)) throw new Error("actionsList must be an array")
	if (!string) return
	string = string.toLowerCase();
	let matches = []
	actionsList.forEach(name => {
		name = name.toLowerCase();
		let match
		if (string.split(' ').includes(name)) {
			match = name;
			matches.push(match)
		}
	});
	return matches
};

function checkIfMentioned(botUserId, raw) {
  if (!botUserId) return undefined
  botUserId = `<@!${botUserId}>`   // adds the tags that discord adds to user
  let messageArgs = message.split(" ")  // split message into arguments
  if (messageArgs.includes(botUserId)) {
    return true
  } else {
    return false
  }
}

module.exports = BotMessageParser
