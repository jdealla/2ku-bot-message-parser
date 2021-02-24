// test.js

const BotMessageParser = require("./index.js")

const text = "/bot hello there? my name is ryan forever.  do you know ALICE SPRINGS?"
const parser = new BotMessageParser({ 
	debug: false,
  model: "./model.json",
	useCompromise: false,
	commandPrefix: "/",
	namesList: [
		"ryan forever",
		"alice springs"
	]

})

parser.process("help").then(console.log)

/*

{
  id: undefined,
  type: undefined,
  timestamp: undefined,
  raw: '/bot hello there? my name is ryan forever.  do you know ALICE SPRINGS?',
  text: 'hello there? my name is ryan forever.  do you know ALICE SPRINGS?',
  clean: 'hello there my name is ryan forever do you know alice springs',
  attachments: undefined,
  command: 'bot',
  commandRaw: '/bot',
  hasCommand: true,
  commandOnly: false,
  botMentioned: undefined,
  yes: undefined,
  no: undefined,
  maybe: undefined,
  idk: undefined,
  what: undefined,
  arguments: [
    'hello',   'there',
    'my',      'name',
    'is',      'ryan',
    'forever', 'do',
    'you',     'know',
    'alice',   'springs'
  ],
  names: [ 'ryan forever', 'alice springs' ],
  hasIntent: undefined,
  intent: undefined,
  numEntities: 0,
  entities: [],
  sentiment: undefined,
  hashtags: [],
  urls: [],
  emails: [],
  phoneNumbers: [],
  verbs: [],
  nouns: []
}

*/


