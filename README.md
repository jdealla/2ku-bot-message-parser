# bot-message-parser

a simple tool for chatbots to extract useful data from user input.


## operation
Create a new `BotMessageParser` object.

```javascript
const BotMessageParser = require("bot-message-parser")

const parser = new BotMessageParser({ 
    debug: false,
    useCompromise: false,
    commandPrefix: "/",
    namesList: [
        "ryan forever",
        "alice springs"
    ]
});

parser.process(text).then(console.log)
````

`.process()` is an async function and will produce the following outputs:

`.raw`: the original text

`.text`: the original text, flattned to lower case

`.clean`: text cleaned of any punctuation, flattened to lowercase, and the dictionary mappings applied.

`trigger`: the parsed trigger (i.e. !bot or !command, etc)

`.hasTrigger`: `true` if message contains a trigger

`.triggerOnly`: `true` if the message contains just the trigger

`.yes`: `boolean` if user says something like "yes", "yeah", "yep", etc

`.no`: `boolean` if user says something like "no", "nah", "hell no", etc

`.maybe`: `boolean` if user says something like "maybe", "not sure", "possibly", etc

`.idk`: `boolean` if user says something like "idk", "i dont know", "no idea". etc

`.what`: `boolean` if user says something like "what?", "huh?","i dont understand", etc

`arguments`: converts the message string into an array that can be useful for getting arguments

`names`: returns an array of found names, if a `namesList` is specified in settings

`intent`: **NLP ONLY** intent of the message

`numEntities`: **NLP ONLY** number of entities found

`entities`: **NLP ONLY** an array of entities

`sentiment`: **NLP ONLY** sentiment of the message (positive, negative, or neutral)


## compromise

in the options, if you set `useCompromise` to `true`, you can activate the nlp processing from [compromise](https://www.npmjs.com/package/compromise)

this will search for sever useful things in the message, such as `hashtags`, `urls`, `emails`, `phoneNumbers`, `verbs`, and `nouns`


## nlp-js

currently, this this uses [nlp-js](https://www.npmjs.com/package/@nlpjs/nlp) v3.10.0.  if you train a model using this module, you can specify a path to it in the options.

## output
```javascript

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
```