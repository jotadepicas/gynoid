const SlackAdapter = require('../adapters/slack');
const Droid = require('../gynoid');
const logger = require('../logger');

function build(name, slackToken, config) {
  logger.info(`Constructing ${name}...`);
  const adapter = new SlackAdapter(slackToken);
  var droid = new Droid(name, adapter, config);
  logger.info(`Construction complete: ${name} ready for work`);
  return droid;
};

module.exports = function buildSlackbot(definition, config) {
  const droid = build(definition.name, definition.token, config);

  // Load all configured extensions
  definition.extensions = definition.extensions || [];
  definition.extensions.forEach((extension) => droid.loadExtension(extension.name, extension.repository));
  return droid;
};
