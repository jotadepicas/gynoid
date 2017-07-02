'use strict';

const env = require('./env');
const Configuration = require('./configuration');
const Extender = require('./extender');
const buildNoid = require('./factory');
const logger = require('./logger');
const gitUrls = ['https:', 'git@github', 'git@gitlab.auth0.com'];

class Cluster {
  constructor(configuration, extender) {
    this.configuration = configuration || new Configuration(env.GYNOID_CONFIG_PATH); // Gynoid definitions
    this.extender = extender || new Extender(this.configuration.data.keys['GITHUB_TOKEN']);
    this.gynoids = {}; // Actual Gynoid objects
  }

  startFromRegistry() {
    for (var gynoid in this.configuration.data.gynoids) {
      this.startGynoid(this.configuration.data.gynoids[gynoid])
        .catch((e) => logger.error(e));
    }
  }

  startGynoid(definition) {
    if (this.gynoids[definition.name]) {
      const error = 'Unable to initialize gynoid. Gynoid ID already exists';
      logger.error(error);
      return Promise.reject(error);
    }

    try {
      const gynoidConfiguration = this.configuration.data.gynoids[definition.name] || {};
      const noid = buildNoid(definition, gynoidConfiguration.keys);
      this.configuration.data.gynoids[definition.name] = definition;
      this.configuration.save();
      this.gynoids[definition.name] = noid;
      noid.start();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  disconnectGynoid(id) {
    try {
      const noidToDisconnect = this._getGynoid(id);
      noidToDisconnect.disconnect();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  reloadGynoid(id) {
    try {
      const gynoid = this._getGynoid(id);
      return gynoid.reload(this.configuration.data.gynoids[id].keys);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Disconnects the Gynoid adapter and removes it from the cluster and configuration
  removeGynoid(id) {
    this.disconnectGynoid(id);
    delete this.gynoids[id];
    delete this.configuration.data.gynoids[id];
    this.configuration.save();
    return Promise.resolve();
  }

  installExtension(repository, gynoidId) {
    const gynoid = this._getGynoid(gynoidId);
    const repo = this._getRepository(repository);
    logger.info(repo);
    return this.extender.clone(repo.url, repo.name)
      .then(() => this.extender.installDependencies(repo.name))
      .then(() => {
        gynoid.loadExtension(repo.name, repo.url);
        this.configuration.data.gynoids[gynoidId].extensions.push({ name: repo.name, repository: repo.url });
        this.configuration.save();
      });
  }

  removeExtension(extensionName, gynoidId) {
    const gynoid = this._getGynoid(gynoidId);
    logger.info(`Current gynoid ${gynoidId} extensions: ${JSON.stringify(this.configuration.data.gynoids[gynoidId].extensions)}`);
    const extension = this.configuration.data.gynoids[gynoidId].extensions.find((e) => e.name === extensionName);
    if (!extension) {
      const error = `Unable to remove extension ${extensionName} from ${gynoidId}`;
      logger.error(error)
      return Promise.reject(error);
    }

    gynoid.removeExtension(extensionName);
    const extensionIndex = this.configuration.data.gynoids[gynoidId].extensions.indexOf(extension);
    this.configuration.data.gynoids[gynoidId].extensions.splice(extensionIndex, 1);
    this.configuration.save();
    return Promise.resolve();
  }

  addKey(gynoidId, key, value) {
    this.configuration.addKey(gynoidId, key, value);
  }

  removeKey(gynoidId, key) {
    this.configuration.removeKey(gynoidId, key);
  }

  listKeys(gynoidId) {
    return this.configuration.listKeys(gynoidId);
  }

  _getGynoid(gynoidId) {
    const gynoid = this.gynoids[gynoidId];
    if (!gynoid) {
      const error = `Unable to install extension. Bot not found: ${gynoidId}`;
      logger.error(error);
      throw new Error(error);
    }

    return gynoid;
  }
  _getRepository(repository) {
    try {
      const isGitUrl = gitUrls.find((url) => repository.startsWith(url));
      const parts = repository.split('/');

      return {
        name: parts[parts.length - 1].split('#')[0], // Discards branch or tag name
        organization: parts[parts.length - 2],
        url: isGitUrl ? repository : 'https://github.com/' + repository
      };
    } catch (e) {
      const error = 'Unable to parse repository URL';
      logger.error(error);
      throw new Error(error);
    }
  }
}

const cluster = new Cluster();
module.exports = cluster;
