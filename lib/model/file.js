'use strict';

const BaseMessage = require('./base-message');

module.exports = class File extends BaseMessage {
  constructor(data) {
    super(data);
    this.title = data.file.title;
    this.filename = data.file.name;
    this.mimetype = data.file.mimetype;
    this.filetype = data.file.filetype;
    this.privateUrl = data.file.url_private_download;
    this.permalink = data.file.permalink;
  }
};
