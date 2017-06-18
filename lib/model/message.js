const Message = require('./text-message');
const FileMessage = require('./file');
const Reaction = require('./reaction');

module.exports = function (data) {
  if (data.subtype === 'file_share') {
    return new FileMessage(data);
  }

  if (data.reaction) {
    return new Reaction(data);
  }

  // Default
  return new Message(data);
};
