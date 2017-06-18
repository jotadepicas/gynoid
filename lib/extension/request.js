'use strict';

module.exports = class Request {
  constructor(data) {
    this.message = data.message;
    this.params = data.params;
    delete data.params;
  }
};
