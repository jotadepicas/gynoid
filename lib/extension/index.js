'use strict';

const NoidParser = require('./parser');
const logger = require('../logger');

module.exports = class NoidExtension {
  constructor(adapter, name, repository, config) {
    if (!adapter) {
      throw new Error('Unable to initialize Noid. Missing token');
    }

    this.name = name || 'Anonymous';
    this.adapter = adapter;
    this.listeners = [];
    this.repository = repository;
    this.config = config;
    this.parser = new NoidParser(adapter, this);
  }

  reset() {
    this.listeners = [];
  }

  addListener(action, core) {
    const listeners = this.parser.parseAction(action, core);
    this.listeners = this.listeners.concat(listeners);
  }

  parseDefinition(definitionPath, rootPath) {
    const parsedDefinition = this.parser.parse(definitionPath, rootPath, this.config);
    this.listeners = this.listeners.concat(parsedDefinition.listeners);
    this.core = parsedDefinition.core;
  }

  onMessage(message) {
    const typeListeners = this.listeners.filter((l) => l.type !== 'reaction_added' || l.type !== 'reaction_removed');
    this._runListeners(message, typeListeners);
  }

  onReactionAdded(message) {
    const typeListeners = this.listeners.filter((l) => l.type === 'reaction_added');
    this._runListeners(message, typeListeners);
  }

  onReactionRemoved(message) {
    const typeListeners = this.listeners.filter((l) => l.type === 'reaction_removed');
    this._runListeners(message, typeListeners);
  }

  _runListeners(message, typeListeners) {
    var msg = this.parser.parseMessage(message);
    typeListeners.forEach((l) => {
      var interceptedMessage = l.intercept(msg);
      if (!interceptedMessage) {
        return; // Ignore
      }

      const request = this.adapter.buildRequest(interceptedMessage);
      const response = this.adapter.buildResponse(interceptedMessage);
      try {
        var handler = l.handler.bind(this.core);
        handler(request, response);
      } catch (e) {
        logger.error(e);
      }
    });
  }
};