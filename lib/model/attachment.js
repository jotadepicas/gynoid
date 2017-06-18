'use strict';

module.exports = class Attachment {
  constructor(data) {
    this.text = data.text;
    this.fallback = data.fallback;
    this.pretext = data.pretext;
    this.title = data.title;
    this.footer = data.footer;
    this.color = data.color;
    this.link = data.title_link;
    this.fields = data.fields || [];
  }
};
