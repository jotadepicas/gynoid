'use strict';

const BaseMessage = require('./base-message');

module.exports = class Reaction extends BaseMessage {
  constructor(data) {
    super(data);
    this.action = data.type.replace('reaction_', '');
    this.reaction = data.reaction;
    this.targetMessage = data.item.ts;
    this.targetMessageOwner = data.item_user;
  }
};
