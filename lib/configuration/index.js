'use strict';

const fs = require('fs');
const logger = require('../logger');

module.exports = class Configuration {
  constructor(configPath) {
    this.configPath = configPath;
    this.read();

    // Set defaults
    this.data.gynoids = this.data.gynoids || {};
  }

  read() {
    try {
      var content = fs.readFileSync(this.configPath);
      this.data = JSON.parse(content);
      return this.data;
    } catch (e) {
      throw new Error({ error: 'config_read_error', message: 'Unable to read the configuration file' });
    }
  }

  save() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2));
      logger.info('Configuration file saved.');
    } catch (err) {
      throw new Error({ error: 'config_write_error', message: 'Unable to write configuration file.' });
    }
  }

  saveDroid(id, gynoid) {
    this.read();
    this.data.gynoids = this.data.gynoids || {};
    this.data.gynoids[id] = gynoid;
    this.gynoids[id] = id;
    this.save();
  }

  removeDroid(gynoid) {
    var config = this.read();
    if (this.data.gynoids) {
      delete this.data.gynoids[gynoid];
    }

    delete this.gynoids[gynoid];
    this.save(config);
  }

  addExtension(gynoid, extension) {
    var config = this.read();
    if (this.data.gynoids[gynoid].extensions.indexOf(extension) === -1) {
      this.data.gynoids[gynoid].extensions.push(extension);
      this.save(config);
    }
  }

  removeExtension(gynoid, extension) {
    this.read();
    var index = this.data.gynoids[gynoid].extensions.indexOf(extension);
    this.data.gynoids[gynoid].extensions.splice(index, 1);
    this.save();
  }

  addKey(gynoid, key, value) {
    this.read();
    this.data.gynoids[gynoid].keys = this.data.gynoids[gynoid].keys || {};
    this.data.gynoids[gynoid].keys[key] = value;
    this.save();
  }

  removeKey(gynoid, key) {
    var config = this.read();

    this.data.gynoids[gynoid].keys = this.data.gynoids[gynoid].keys || {};
    delete this.data.gynoids[gynoid].keys[key];
    this.save(config);
  };

  listKeys(gynoid) {
    this.read();
    this.data.gynoids[gynoid].keys = this.data.gynoids[gynoid].keys || {};
    return Object.keys(this.data.gynoids[gynoid].keys || {});
  }

  listAllKeys() {
    this.read();
    var keys = [];

    Object.keys(this.data.keys).map(function (key) {
      if (typeof this.data.keys[key] !== 'object') {
        keys.push(key);
      } else {
        Object.keys(this.data.keys[key]).forEach(function (k) {
          keys.push(k);
        });
      }
    });

    return keys;
  };
}

