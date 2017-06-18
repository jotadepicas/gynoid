'use strict';

const ACLs = require('./acls');

module.exports = class Listener {
  constructor(options, adapter) {
    if (typeof type === 'function') {
      options.handler = options.type;
      options.type = 'text';
    }

    this.expression = options.expression;
    this.type = options.type;
    this.typeMatchers = {
      'text': this.matchText.bind(this),
      'attachment': this.matchAttachment.bind(this),
      'file': this.matchFile.bind(this),
      'reaction_added': this.matchReactionAdded.bind(this),
      'reaction_removed': this.matchReactionRemoved.bind(this)
    };

    const expr = this.expression.replace(/:[a-zA-Z]+\(([^\)]*)\)/g, '($1)');
    this.regexp = new RegExp(`^${expr}$`);
    this.handler = options.handler;
    this.adapter = adapter;
    this.acls = new ACLs(options.acls || {});
  }

  isMatch(text) {
    return !!text.match(this.regexp);
  }

  intercept(message) {
    if (this.acls.isValid(message)) {
      return this.typeMatchers[this.type](message);
    }

    return undefined;
  }

  matchText(message) {
    const match = this.getMatchFromValue(message.text || '');
    if (!match) {
      return undefined;
    }

    return {
      params: match,
      message: message
    };
  }

  matchAttachment(message) {
    var match;
    var index = 0;
    while (!match && index < message.attachments.length) {
      var attachment = message.attachments[index];
      var value = this.field ? attachment[this.field] : attachment.title;
      match = this.getMatchFromValue(value);
      index++;
    }

    if (!match) {
      return undefined;
    }

    return {
      params: match,
      message: message
    };
  }

  matchFile(message) {
    var match = this.getMatchFromValue(message.title);
    if (!match) {
      return undefined;
    }

    return {
      params: match,
      message: message
    };
  }

  matchReactionAdded(message) {
    if (message.action !== 'added') {
      return undefined;
    }

    return this.matchReaction(message);
  }

  matchReactionRemoved(message) {
    if (message.action !== 'removed') {
      return undefined;
    }

    return this.matchReaction(message);
  }

  matchReaction(message) {
    const match = this.getMatchFromValue(message.reaction);
    if (!match) {
      return undefined;
    }

    return {
      params: match,
      message: message
    };
  }

  getMatchFromValue(text) {
    text = text || '';
    if (!this.isMatch(text)) {
      return undefined;
    }

    return this.getParams(text, this.expression, this.regexp);
  }

  getParams(text, value, matcher) {
    const payload = {};

    if (value instanceof RegExp) {
      return payload;
    }

    let payloadList = value.match(/:[a-zA-Z]+/g);

    if (!payloadList) {
      return payload;
    }

    // remove leading ":" in named regex
    payloadList = payloadList.map(v => {
      return v.replace(/^:/, '');
    });

    for (let i = 0; i < payloadList.length; i++) {
      const regexIndex = `$${(i + 1)}`;
      const payloadName = payloadList[i];
      payload[payloadName] = text.replace(matcher, regexIndex);
    }

    return payload;
  }

};
