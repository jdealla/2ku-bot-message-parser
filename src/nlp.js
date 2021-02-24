var { NlpManager } = require('node-nlp');

const nlp = new NlpManager({ languages: ['en'], nlu: { log: true } });
nlp.load(`./nlp/model.nlp`);

module.exports = nlp