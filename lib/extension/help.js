const path = require('path');

module.exports = function help(extensionName) {
  const workDirectory = path.join(process.cwd(), 'droids', extensionName);
  return (req, res) => {
    var metadata = require(workDirectory + '/droid.json');
    var actionsWithDescription = metadata.actions.filter((action) => {
      return action.help;
    }).map((action) => action.help);

    if (actionsWithDescription.length === 0) {
      return;
    }

    return res.text('Help (`' + extensionName + '`):\n- ' + actionsWithDescription.join('\n- '));
  }
};
