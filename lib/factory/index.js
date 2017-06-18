
// Specific Factories
const slackbot = require('./slackbot');

module.exports = function build(definition, config) {
  config = config || {};
  switch(definition.type) {
    case 'SLACK':
      return slackbot(definition, config);
    default:
      return slackbot(definition, config);
  }
};
