'use strict';

const logger = require('../logger');

function stripEmoji(emoji) {
  const noTagEmoji = emoji.replace(/:?([^:]+):?/, '$1');
  return noTagEmoji.replace(/:+skin-tone.*/, '');
}

module.exports = class Response {
  constructor(message, adapter) {
    this.adapter = adapter;
    this.message = message.message;
  }

  getChannelByName(username) {
    return this.adapter.getChannelByName(username);
  }

  getTargetId(name) {
    switch (name[0]) {
      case '@':
        return this.adapter.getDMByName(name.slice(1, name.length)).id;
      case '#':
        return this.adapter.getChannelOrGroupByName(name.slice(1, name.length)).id;
      default:
        return this.message.channel.id;
    }
  }

  text(text, channel) {
    logger.info(`Sending text message: ${text}`);
    const id = this.getTargetId(channel || '');
    return this.adapter.text(text, id);
  }

  attachment(attachment, channel) {
    const id = this.getTargetId(channel || '');
    return this.adapter.attachment(attachment, id);
  }

  upload(file, channel) {
    const id = this.getTargetId(channel || '');
    return this.adapter.upload(file, id);
  }

  addReaction(emoji, messageId, channel) {
    return this.reaction(emoji, messageId, channel);
  }

  reaction(emoji, messageId, channel) {
    messageId = messageId || this.message.timestamp;
    const id = this.getTargetId(channel || '');
    return this.adapter.addReaction({
      emoji: stripEmoji(emoji),
      channel: id,
      timestamp: messageId
    });
  }

  removeReaction(emoji, messageId, channel) {
    messageId = messageId || this.message.timestamp;
    const id = this.getTargetId(channel || '');
    return this.adapter.removeReaction({
      emoji: stripEmoji(emoji),
      channel: id,
      timestamp: messageId
    });
  }
};
