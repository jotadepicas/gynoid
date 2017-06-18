'use strict';

module.exports = class BaseMessage {
  constructor(data) {
    this.channel = data.channel || (data.item && data.item.channel);
    this.from = data.user;
    this.timestamp = data.ts;
    this.isBotUser = !!data.bot_id;
    this.attachments = [];
  }
};
