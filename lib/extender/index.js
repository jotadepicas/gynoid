'use strict';

const logger = require('../logger');
const exec = require('child_process').exec;
const path = require("path");

module.exports = class NoidExtender {
  constructor(token, nodegit, rimraf) {
    this.token = token;
    this.nodegit = nodegit || require('nodegit');
    this.rimraf = rimraf || require('rimraf');
  }

  _certificateCheck() {
    return 1;
  }

  _getCredentials() {
    return this.nodegit.Cred.userpassPlaintextNew(this.token, "x-oauth-basic");
  }

  clone(repo, folder) {
    logger.info(`Cloning repository: ${repo} into ${folder}`);
    var localPath = this._getInstallPath(folder);
    this.rimraf.sync(localPath);
    const cloneOptions = {
      fetchOpts: {
        callbacks: {
          certificateCheck: this._certificateCheck.bind(this),
        }
      }
    };

    if (this.token) {
      logger.info('Using access token to clone repository');
      cloneOptions.fetchOpts.callbacks.credentials = this._getCredentials.bind(this);
    }

    return this.nodegit.Clone(repo, localPath, cloneOptions)
      .catch((e) => {
        const msg = 'An error occurred while cloning the repository: ' + e.toString();
        logger.error(msg);
        throw new Error(msg);
      });
  }

  installDependencies(folder) {
    const installPath = this._getInstallPath(folder);
    logger.info('Installing droid dependencies...');
    return new Promise((resolve, reject) => {
      exec('npm install', {
        cwd: installPath
      }, (err, stdout, stderr) => {
        logger.error(stderr);
        logger.log(stdout);

        if (err) {
          var msg = 'ERROR while installing droid dependencies. Error: ' + JSON.stringify(err, null, 2);
          logger.error(msg);
          return reject(msg);
        }

        logger.info('Dependencies successfully installed.');
        return resolve();
      });
    });
  }

  _getInstallPath(folder) {
    return path.join(process.cwd(), 'droids', folder);
  }
};
